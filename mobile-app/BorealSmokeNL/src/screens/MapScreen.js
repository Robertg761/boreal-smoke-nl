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
    if (!data?.predictions || !data.predictions[currentHour]) {
      return [];
    }
    return data.predictions[currentHour];
  };

  /**
   * Render wildfire markers
   */
  const renderFireMarkers = () => {
    if (!data?.wildfires) return null;
    
    return data.wildfires.map((fire) => (
      <Marker
        key={fire.fire_id}
        coordinate={{
          latitude: fire.latitude,
          longitude: fire.longitude,
        }}
        onPress={() => onFirePress(fire)}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={[styles.fireMarker, { backgroundColor: fire.statusColor }]}>
          <Icon name="fire" size={20} color="#FFF" />
        </View>
      </Marker>
    ));
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

      {/* Legend */}
      <Legend />

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
