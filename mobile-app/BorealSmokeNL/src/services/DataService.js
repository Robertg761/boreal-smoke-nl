/**
 * Data Service for Boreal Smoke NL
 * Handles all data fetching from our GitHub Pages API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://robertg761.github.io/boreal-smoke-nl';
const CACHE_KEY = 'boreal_smoke_data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class DataService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.isLoading = false;
    this.listeners = [];
  }

  /**
   * Subscribe to data updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of data changes
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  /**
   * Fetch data with caching and error handling
   */
  async fetchData(forceRefresh = false) {
    // Check if we have valid cached data
    if (!forceRefresh && this.cache && this.isCacheValid()) {
      return this.cache;
    }

    // Prevent multiple simultaneous fetches
    if (this.isLoading) {
      return this.cache || this.getStoredData();
    }

    this.isLoading = true;

    try {
      // Fetch from API
      const response = await fetch(`${API_BASE_URL}/data.json`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and enhance data
      const processedData = this.processData(data);
      
      // Update cache
      this.cache = processedData;
      this.lastFetch = Date.now();
      
      // Store in AsyncStorage for offline access
      await this.storeData(processedData);
      
      // Notify listeners
      this.notifyListeners(processedData);
      
      return processedData;
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Try to return cached data
      const storedData = await this.getStoredData();
      if (storedData) {
        this.cache = storedData;
        return storedData;
      }
      
      // Return minimal fallback data
      return this.getFallbackData();
      
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process raw data to enhance it for the app
   */
  processData(data) {
    return {
      ...data,
      processedAt: new Date().toISOString(),
      wildfires: this.processWildfires(data.wildfires || []),
      predictions: this.processPredictions(data.predictions || []),
      communities: this.extractCommunities(data.predictions || []),
    };
  }

  /**
   * Process wildfire data
   */
  processWildfires(wildfires) {
    return wildfires.map(fire => ({
      ...fire,
      displayName: fire.fire_name || `Fire ${fire.fire_id}`,
      statusColor: this.getStatusColor(fire.status),
      sizeCategory: this.getSizeCategory(fire.size_hectares),
    }));
  }

  /**
   * Process prediction data
   */
  processPredictions(predictions) {
    return predictions.map(pred => ({
      ...pred,
      aqhiColor: this.getAQHIColor(pred.aqhi_value),
      aqhiLabel: this.getAQHILabel(pred.aqhi_value),
      riskLevel: this.getRiskLevel(pred.aqhi_value),
    }));
  }

  /**
   * Extract unique communities from predictions
   */
  extractCommunities(predictions) {
    const communities = new Map();
    
    predictions.forEach(pred => {
      const key = `${pred.latitude},${pred.longitude}`;
      if (!communities.has(key)) {
        communities.set(key, {
          lat: pred.latitude,
          lon: pred.longitude,
          name: this.getCommunityName(pred.latitude, pred.longitude),
          currentAQHI: pred.aqhi_value,
        });
      }
    });
    
    return Array.from(communities.values());
  }

  /**
   * Get status color for wildfire
   */
  getStatusColor(status) {
    const colors = {
      'OC': '#FF0000',  // Red - Out of Control
      'BH': '#FFA500',  // Orange - Being Held
      'UC': '#FFFF00',  // Yellow - Under Control
      'OUT': '#00FF00', // Green - Out
    };
    return colors[status] || '#808080';
  }

  /**
   * Get size category for wildfire
   */
  getSizeCategory(hectares) {
    if (hectares < 10) return 'Small';
    if (hectares < 100) return 'Medium';
    if (hectares < 1000) return 'Large';
    return 'Very Large';
  }

  /**
   * Get AQHI color
   */
  getAQHIColor(value) {
    if (value <= 3) return '#00FF00';  // Green - Low Risk
    if (value <= 6) return '#FFFF00';  // Yellow - Moderate Risk
    if (value <= 10) return '#FFA500'; // Orange - High Risk
    return '#FF0000';                  // Red - Very High Risk
  }

  /**
   * Get AQHI label
   */
  getAQHILabel(value) {
    if (value <= 3) return 'Low Risk';
    if (value <= 6) return 'Moderate Risk';
    if (value <= 10) return 'High Risk';
    return 'Very High Risk';
  }

  /**
   * Get risk level
   */
  getRiskLevel(value) {
    if (value <= 3) return 'low';
    if (value <= 6) return 'moderate';
    if (value <= 10) return 'high';
    return 'very-high';
  }

  /**
   * Get community name from coordinates
   */
  getCommunityName(lat, lon) {
    const communities = {
      '47.5615,-52.7126': "St. John's",
      '47.5189,-52.8061': 'Mount Pearl',
      '47.5297,-52.9547': 'Conception Bay South',
      '47.5361,-52.8579': 'Paradise',
      '47.3875,-53.1356': 'Holyrood',
      '47.5989,-53.2644': 'Bay Roberts',
      '47.7369,-53.2144': 'Carbonear',
      '47.7050,-53.2144': 'Harbour Grace',
    };
    
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    return communities[key] || 'Unknown Location';
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    if (!this.lastFetch) return false;
    const age = Date.now() - this.lastFetch;
    return age < CACHE_DURATION;
  }

  /**
   * Store data in AsyncStorage
   */
  async storeData(data) {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  /**
   * Get stored data from AsyncStorage
   */
  async getStoredData() {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        // Check if stored data is not too old (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error retrieving stored data:', error);
    }
    return null;
  }

  /**
   * Get fallback data for when everything fails
   */
  getFallbackData() {
    return {
      wildfires: [],
      predictions: [],
      weather: [],
      communities: [
        { lat: 47.5615, lon: -52.7126, name: "St. John's", currentAQHI: 1 },
        { lat: 47.5189, lon: -52.8061, name: "Mount Pearl", currentAQHI: 1 },
        { lat: 47.5297, lon: -52.9547, name: "Conception Bay South", currentAQHI: 1 },
        { lat: 47.5361, lon: -52.8579, name: "Paradise", currentAQHI: 1 },
        { lat: 47.3875, lon: -53.1356, name: "Holyrood", currentAQHI: 1 },
        { lat: 47.5989, lon: -53.2644, name: "Bay Roberts", currentAQHI: 1 },
        { lat: 47.7369, lon: -53.2144, name: "Carbonear", currentAQHI: 1 },
        { lat: 47.7050, lon: -53.2144, name: "Harbour Grace", currentAQHI: 1 },
      ],
      error: 'Unable to fetch data. Please check your connection.',
      isOffline: true,
    };
  }

  /**
   * Get metadata
   */
  async fetchMetadata() {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata.json`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new DataService();
