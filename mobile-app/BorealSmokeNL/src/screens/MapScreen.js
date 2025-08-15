/**
 * Main Map Screen for Boreal Smoke NL
 * Displays wildfires, air quality overlay, and community information
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import MapView, { Marker, Circle, Overlay, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DataService from '../services/DataService';
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
  const [currentHour, setCurrentHour] = useState(0);
  const [mapType, setMapType] = useState('standard');
  const [showStats, setShowStats] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(false); // Disable animation by default for performance
  
  const mapRef = useRef(null);
  const emergencyPulse = useRef(new Animated.Value(1)).current;

  // Load data on mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    let animationLoop = null;
    
    loadData();
    
    // Only start animation if enabled (for performance)
    if (animationEnabled) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(emergencyPulse, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(emergencyPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animationLoop.start();
    }
    
    // Subscribe to data updates with mounted check
    const unsubscribe = DataService.subscribe((newData) => {
      if (isMounted) {
        setData(newData);
      }
    });
    
    // Set up auto-refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        loadData(false);
      }
    }, 30 * 60 * 1000);
    
    return () => {
      isMounted = false; // Prevent state updates
      if (animationLoop) {
        animationLoop.stop(); // Stop animation
      }
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe from data updates
      }
      clearInterval(refreshInterval); // Clear refresh interval
    };
  }, [animationEnabled]); // Add animationEnabled as dependency

  /**
   * Load data from service
   */
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const fetchedData = await DataService.fetchData();
      setData(fetchedData);
      
      // No default selection needed anymore
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
  }, []);

  /**
   * Handle refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  /**
   * Handle fire marker press
   */
  const onFirePress = useCallback((fire) => {
    setSelectedInfo({ type: 'fire', ...fire });
  }, []);


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
   * Get marker size based on fire size - memoized
   */
  const getFireMarkerSize = useCallback((hectares) => {
    if (hectares < 10) return 24;
    if (hectares < 100) return 30;
    if (hectares < 1000) return 36;
    if (hectares < 5000) return 42;
    return 48; // Very large fires (like the 9,127 hectare one)
  }, []);

  /**
   * Get icon size based on marker size
   */
  const getFireIconSize = (hectares) => {
    const markerSize = getFireMarkerSize(hectares);
    return markerSize * 0.6; // Icon is 60% of marker size
  };

  /**
   * Render smoke overlays for Out of Control fires - memoized
   */
  const renderSmokeOverlays = useMemo(() => {
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
  }, [data?.wildfires]);

  /**
   * Render wildfire markers - memoized
   */
  const renderFireMarkers = useMemo(() => {
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
          tracksViewChanges={false}
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
  }, [data?.wildfires, onFirePress, getFireMarkerSize]);





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
        {renderSmokeOverlays}
        {renderFireMarkers}
      </MapView>

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

      {/* Fire Statistics Dashboard */}
      <FireStatsDashboard 
        wildfires={data?.wildfires || []}
        isExpanded={showStats}
        onToggle={() => setShowStats(!showStats)}
      />

      {/* Legend Toggle Button */}
      <TouchableOpacity
        style={styles.legendToggle}
        onPress={() => setShowLegend(!showLegend)}
      >
        <Icon name="information" size={24} color="#333" />
      </TouchableOpacity>
      
      {/* Legend - shown when toggled */}
      {showLegend && (
        <View style={styles.legendContainer}>
          <Legend />
        </View>
      )}

      {/* Info Panel */}
      <InfoPanel 
        data={selectedInfo}
        onClose={() => setSelectedInfo(null)}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={24} color="#333" />
      </TouchableOpacity>

      {/* Fire Details Modal removed - using InfoPanel only */}
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
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 10,
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
    padding: 6,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  legendToggle: {
    position: 'absolute',
    left: 10,
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
  legendContainer: {
    position: 'absolute',
    left: 10,
    bottom: 150,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
