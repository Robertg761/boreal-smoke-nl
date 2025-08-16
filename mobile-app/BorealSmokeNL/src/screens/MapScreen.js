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
  SafeAreaView,
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
  const [error, setError] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [showStats, setShowStats] = useState(false);
  
  const mapRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    let isMounted = true;
    
    loadData();
    
    // Subscribe to data updates
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
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, []);

  /**
   * Load data from service
   */
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    try {
      const fetchedData = await DataService.fetchData();
      
      // Check if we have offline/error data
      if (fetchedData.isOffline || fetchedData.error) {
        setError(fetchedData.error || 'Currently showing offline data');
      }
      
      setData(fetchedData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Unable to load wildfire data. Please check your connection.');
      
      // Don't show alert if we're refreshing - just show error in UI
      if (showLoader) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the wildfire data service. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: () => loadData(true) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }
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
    if (!data?.wildfires || !Array.isArray(data.wildfires)) return null;
    
    // Only show smoke for Out of Control fires
    const ocFires = data.wildfires.filter(fire => {
      // Validate fire object has required properties
      return fire && 
             fire.status === 'OC' && 
             typeof fire.latitude === 'number' && 
             typeof fire.longitude === 'number' &&
             !isNaN(fire.latitude) && 
             !isNaN(fire.longitude);
    });
    
    return ocFires.map((fire) => {
      // Calculate smoke radius based on fire size
      const getBaseRadius = (hectares) => {
        if (hectares < 100) return 8000;
        if (hectares < 1000) return 15000;
        if (hectares < 5000) return 25000;
        return 35000; // Very large fires like the 9,127 hectare one
      };
      
      const baseRadius = getBaseRadius(fire.size_hectares || 0);
      
      // Ensure coordinates are valid numbers
      const lat = Number(fire.latitude);
      const lon = Number(fire.longitude);
      
      if (isNaN(lat) || isNaN(lon)) {
        console.warn(`Invalid coordinates for fire ${fire.fire_id}`);
        return null;
      }
      
      return (
        <React.Fragment key={`smoke-${fire.fire_id}`}>
          {/* Outer smoke layer - lightest */}
          <Circle
            center={{
              latitude: lat,
              longitude: lon,
            }}
            radius={baseRadius}
            fillColor="rgba(105, 105, 105, 0.15)"
            strokeWidth={0}
          />
          
          {/* Middle smoke layer */}
          <Circle
            center={{
              latitude: lat,
              longitude: lon,
            }}
            radius={baseRadius * 0.6}
            fillColor="rgba(105, 105, 105, 0.25)"
            strokeWidth={0}
          />
          
          {/* Inner danger zone for large fires */}
          {fire.size_hectares > 1000 && (
            <Circle
              center={{
                latitude: lat,
                longitude: lon,
              }}
              radius={baseRadius * 0.3}
              fillColor="rgba(255, 69, 0, 0.2)"
              strokeColor="rgba(255, 69, 0, 0.4)"
              strokeWidth={1}
            />
          )}
        </React.Fragment>
      );
    }).filter(item => item !== null);
  }, [data?.wildfires]);

  /**
   * Render wildfire markers - memoized
   */
  const renderFireMarkers = useMemo(() => {
    if (!data?.wildfires || !Array.isArray(data.wildfires)) return null;
    
    // Filter out fires with invalid coordinates
    const validFires = data.wildfires.filter(fire => {
      return fire && 
             typeof fire.latitude === 'number' && 
             typeof fire.longitude === 'number' &&
             !isNaN(fire.latitude) && 
             !isNaN(fire.longitude);
    });
    
    // Sort fires by size so smaller ones render on top
    const sortedFires = [...validFires].sort((a, b) => 
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
  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="fire" size={48} color="#FF6B6B" style={{ marginBottom: 16 }} />
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading wildfire data...</Text>
        <Text style={styles.loadingSubtext}>Fetching latest information from NL Fire Service</Text>
      </View>
    );
  }
  
  // Show error screen if no data at all
  if (!data && error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="wifi-off" size={48} color="#999" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={AVALON_REGION}
        provider={PROVIDER_GOOGLE} // Use Google Maps on both platforms
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {renderSmokeOverlays}
        {renderFireMarkers}
      </MapView>

      {/* Fire Statistics Dashboard - At the top */}
      <FireStatsDashboard 
        wildfires={data?.wildfires || []}
        isExpanded={showStats}
        onToggle={() => setShowStats(!showStats)}
      />

      {/* Side Control Buttons Group */}
      <View style={styles.sideControls}>
        {/* Map Type Toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Icon 
            name={mapType === 'standard' ? 'satellite-variant' : 'map'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onRefresh}
        >
          <Icon name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Legend - always visible */}
      <Legend />

      {/* Info Panel */}
      <InfoPanel 
        data={selectedInfo}
        onClose={() => setSelectedInfo(null)}
      />

      {/* Error Banner */}
      {error && data && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color="#FFF" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Icon name="close" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// UI Constants
const BUTTON_SIZE = 44;
const BUTTON_PADDING = 10;
const STANDARD_SHADOW = {
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
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
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    ...STANDARD_SHADOW,
  },
  errorBannerText: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    marginLeft: 8,
  },
  sideControls: {
    position: 'absolute',
    right: 10,
    bottom: 30,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...STANDARD_SHADOW,
  },
  fireMarker: {
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
});

export default MapScreen;
