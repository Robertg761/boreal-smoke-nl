/**
 * Main Map Screen for Boreal Smoke NL
 * Displays wildfires, air quality overlay, and community information
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, Overlay, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DataService from '../services/DataService';
import CommunitySelector from '../components/CommunitySelector';
import FireDetailsModal from '../components/FireDetailsModal';
import InfoPanel from '../components/InfoPanel';
import Legend from '../components/Legend';
import FireStatsDashboard from '../components/FireStatsDashboard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Avalon Peninsula region bounds
const AVALON_REGION = {
  latitude: 47.5,
  longitude: -53.0,
  latitudeDelta: 2.0,
  longitudeDelta: 2.0,
};

const MapScreen = () => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [selectedFire, setSelectedFire] = useState(null);
  const [currentHour, setCurrentHour] = useState(0);
  const [mapType, setMapType] = useState('standard');
  const [showStats, setShowStats] = useState(false);
  
  const mapRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Subscribe to data updates
    const unsubscribe = DataService.subscribe((newData) => {
      setData(newData);
    });
    
    // Set up auto-refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      loadData(false);
    }, 30 * 60 * 1000);
    
    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  /**
   * Load data from service
   */
  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const fetchedData = await DataService.fetchData();
      setData(fetchedData);
      
      // Set default community if none selected
      if (!selectedInfo && fetchedData.communities?.length > 0) {
        // Default to St. John's if available
        const stjohns = fetchedData.communities.find(c => 
          c.name === "St. John's"
        );
        const defaultCommunity = stjohns || fetchedData.communities[0];
        setSelectedInfo({ type: 'community', ...defaultCommunity });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Error Loading Data',
        'Unable to load wildfire data. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  /**
   * Handle fire marker press
   */
  const onFirePress = (fire) => {
    setSelectedInfo({ type: 'fire', ...fire });
    setSelectedFire(fire); // Keep this for the modal for now
  };

  /**
   * Handle community selection
   */
  const onCommunitySelect = (community) => {
    setSelectedInfo({ type: 'community', ...community });
    
    // Animate map to selected community
    if (mapRef.current && community) {
      mapRef.current.animateToRegion({
        latitude: community.lat,
        longitude: community.lon,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
    }
  };

  /**
   * Get current predictions for the selected hour
   */
  const getPredictionsForHour = () => {
    if (!data?.predictions) {
      return [];
    }
    // If predictions is already an array, return it
    if (Array.isArray(data.predictions)) {
      return data.predictions;
    }
    // If predictions is grouped by hour, return the current hour's predictions
    if (data.predictions[currentHour]) {
      return data.predictions[currentHour];
    }
    return [];
  };

  /**
   * Get marker size based on fire size
   */
  const getFireMarkerSize = (hectares) => {
    if (hectares < 10) return 24;
    if (hectares < 100) return 30;
    if (hectares < 1000) return 36;
    if (hectares < 5000) return 42;
    return 48; // Very large fires (like the 9,127 hectare one)
  };

  /**
   * Get icon size based on marker size
   */
  const getFireIconSize = (hectares) => {
    const markerSize = getFireMarkerSize(hectares);
    return markerSize * 0.6; // Icon is 60% of marker size
  };

  /**
   * Render smoke overlays for Out of Control fires
   */
  const renderSmokeOverlays = () => {
    if (!data?.wildfires) return null;
    
    // Only show smoke for Out of Control fires
    const ocFires = data.wildfires.filter(fire => fire.status === 'OC');
    
    return ocFires.map((fire) => {
      // Calculate smoke radius based on fire size
      const getBaseRadius = (hectares) => {
        if (hectares < 100) return 8000;
        if (hectares < 1000) return 15000;
        if (hectares < 5000) return 25000;
        return 35000; // Very large fires like the 9,127 hectare one
      };
      
      const baseRadius = getBaseRadius(fire.size_hectares || 0);
      
      return (
        <React.Fragment key={`smoke-${fire.fire_id}`}>
          {/* Outer smoke layer - lightest */}
          <Circle
            center={{
              latitude: fire.latitude,
              longitude: fire.longitude,
            }}
            radius={baseRadius}
            fillColor="rgba(105, 105, 105, 0.15)"
            strokeWidth={0}
          />
          
          {/* Middle smoke layer */}
          <Circle
            center={{
              latitude: fire.latitude,
              longitude: fire.longitude,
            }}
            radius={baseRadius * 0.6}
            fillColor="rgba(105, 105, 105, 0.25)"
            strokeWidth={0}
          />
          
          {/* Inner danger zone for large fires */}
          {fire.size_hectares > 1000 && (
            <Circle
              center={{
                latitude: fire.latitude,
                longitude: fire.longitude,
              }}
              radius={baseRadius * 0.3}
              fillColor="rgba(255, 69, 0, 0.2)"
              strokeColor="rgba(255, 69, 0, 0.4)"
              strokeWidth={1}
              strokeDashArray={[10, 5]}
              lineDashPhase={0}
            />
          )}
        </React.Fragment>
      );
    });
  };

  /**
   * Render wildfire markers
   */
  const renderFireMarkers = () => {
    if (!data?.wildfires) return null;
    
    // Sort fires by size so smaller ones render on top
    const sortedFires = [...data.wildfires].sort((a, b) => 
      (b.size_hectares || 0) - (a.size_hectares || 0)
    );
    
    return sortedFires.map((fire) => {
      const markerSize = getFireMarkerSize(fire.size_hectares || 0);
      const iconSize = getFireIconSize(fire.size_hectares || 0);
      const isOutOfControl = fire.status === 'OC';
      
      return (
        <Marker
          key={fire.fire_id}
          coordinate={{
            latitude: fire.latitude,
            longitude: fire.longitude,
          }}
          onPress={() => onFirePress(fire)}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[
            styles.fireMarker, 
            { 
              backgroundColor: fire.statusColor,
              width: markerSize,
              height: markerSize,
              borderRadius: markerSize / 2,
              borderWidth: isOutOfControl ? 2 : 1,
              borderColor: isOutOfControl ? '#FFF' : 'rgba(255,255,255,0.5)',
            }
          ]}>
            <Icon name="fire" size={iconSize} color="#FFF" />
            {fire.size_hectares > 1000 && (
              <Text style={styles.fireSize}>
                {Math.round(fire.size_hectares / 1000)}k
              </Text>
            )}
          </View>
        </Marker>
      );
    });
  };

  /**
   * Render air quality overlay circles
   */
  const renderAirQualityOverlay = () => {
    const predictions = getPredictionsForHour();
    if (!predictions || predictions.length === 0) return null;
    
    return predictions.map((pred, index) => (
      <Circle
        key={`aqhi-${index}`}
        center={{
          latitude: pred.latitude,
          longitude: pred.longitude,
        }}
        radius={pred.radius || 5000} // Use radius from data or fallback
        fillColor={pred.color ? `${pred.color}60` : '#00FF0060'} // 60% opacity
        strokeWidth={0}
      />
    ));
  };

  /**
   * Render community markers
   */
  const renderCommunityMarkers = () => {
    if (!data?.communities) return null;
    
    return data.communities.map((community) => (
      <Marker
        key={`community-${community.name}`}
        coordinate={{
          latitude: community.lat,
          longitude: community.lon,
        }}
        onPress={() => onCommunitySelect(community)}
      >
        <View style={styles.communityMarker}>
          <Icon name="home-city" size={16} color="#333" />
        </View>
      </Marker>
    ));
  };

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading wildfire data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={AVALON_REGION}
        provider={Platform.OS === 'ios' ? null : PROVIDER_GOOGLE}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {renderSmokeOverlays()}
        {renderAirQualityOverlay()}
        {renderFireMarkers()}
        {renderCommunityMarkers()}
      </MapView>

      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Community Selector */}
        <CommunitySelector
          communities={data?.communities || []}
          selectedCommunity={selectedInfo?.type === 'community' ? selectedInfo : null}
          onSelect={onCommunitySelect}
        />

        {/* Map Type Toggle */}
        <TouchableOpacity
          style={styles.mapTypeButton}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Icon 
            name={mapType === 'standard' ? 'satellite-variant' : 'map'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>

      {/* Fire Statistics Dashboard */}
      <FireStatsDashboard 
        wildfires={data?.wildfires || []}
        isExpanded={showStats}
        onToggle={() => setShowStats(!showStats)}
      />

      {/* Legend - moved down when stats are shown */}
      <View style={{ top: showStats ? 280 : undefined }}>
        <Legend />
      </View>

      {/* Info Panel */}
      <InfoPanel 
        data={selectedInfo}
        onClose={() => setSelectedInfo(null)}
        timelineHours={12}
        currentTimelineHour={currentHour}
        onTimelineChange={setCurrentHour}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={24} color="#333" />
      </TouchableOpacity>

      {/* Fire Details Modal (can be removed if InfoPanel is sufficient) */}
      {selectedFire && (
        <FireDetailsModal
          visible={selectedInfo?.type === 'fire' && selectedFire?.fire_id === selectedInfo?.fire_id}
          fire={selectedFire}
          onClose={() => setSelectedInfo(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapTypeButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fireMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  fireSize: {
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  communityMarker: {
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  refreshButton: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default MapScreen;
