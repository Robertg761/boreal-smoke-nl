/**
 * Data Service for Boreal Smoke NL
 * Handles all data fetching from our GitHub Pages API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://robertg761.github.io/boreal-smoke-nl';
const CACHE_KEY = 'boreal_smoke_data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

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
      // Fetch from API with retry mechanism
      const data = await this.fetchWithRetry(`${API_BASE_URL}/data.json`);
      
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
      console.error('Error fetching data after retries:', error);
      
      // Try to return cached data
      const storedData = await this.getStoredData();
      if (storedData) {
        this.cache = storedData;
        // Notify listeners that we're using cached data
        this.notifyListeners({ ...storedData, isStale: true });
        return storedData;
      }
      
      // Return minimal fallback data
      const fallbackData = this.getFallbackData();
      this.notifyListeners(fallbackData);
      return fallbackData;
      
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  async fetchWithRetry(url, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      // Check if we should retry
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${delay}ms...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Recursive retry
        return this.fetchWithRetry(url, attempt + 1);
      }
      
      // All retries failed
      throw error;
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
      communities: this.getDefaultCommunities(),
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
   * Get default communities list
   */
  getDefaultCommunities() {
    return [
      { lat: 47.5615, lon: -52.7126, name: "St. John's" },
      { lat: 47.5189, lon: -52.8061, name: "Mount Pearl" },
      { lat: 47.5297, lon: -52.9547, name: "Conception Bay South" },
      { lat: 47.5361, lon: -52.8579, name: "Paradise" },
      { lat: 47.3875, lon: -53.1356, name: "Holyrood" },
      { lat: 47.5989, lon: -53.2644, name: "Bay Roberts" },
      { lat: 47.7369, lon: -53.2144, name: "Carbonear" },
      { lat: 47.7050, lon: -53.2144, name: "Harbour Grace" },
      { lat: 47.4816, lon: -52.7971, name: "Torbay" },
      { lat: 47.3161, lon: -52.9479, name: "Petty Harbour" },
      { lat: 48.9509, lon: -54.6159, name: "Gander" },
      { lat: 49.0919, lon: -55.6514, name: "Grand Falls-Windsor" },
      { lat: 48.3505, lon: -53.9823, name: "Clarenville" },
    ];
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
      communities: this.getDefaultCommunities(),
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
