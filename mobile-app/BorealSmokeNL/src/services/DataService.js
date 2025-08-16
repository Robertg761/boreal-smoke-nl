/**
 * Data Service for Boreal Smoke NL
 * Handles all data fetching from our GitHub Pages API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFireLocation } from '../utils/locationUtils';
import { debugLog, debugWarn, debugError } from '../utils/debug';

const API_BASE_URL = 'https://robertg761.github.io/boreal-smoke-nl';
const CACHE_KEY = 'boreal_smoke_data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MIN_FETCH_INTERVAL = 5000; // Minimum 5 seconds between fetches

class DataService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.lastFetchAttempt = 0;
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

    // Rate limiting - prevent too frequent fetches
    const now = Date.now();
    if (now - this.lastFetchAttempt < MIN_FETCH_INTERVAL) {
      debugWarn('Rate limit: Fetch attempted too soon');
      return this.cache || this.getStoredData();
    }
    this.lastFetchAttempt = now;

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
      debugError('Error fetching data after retries:', error);
      
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
    // Validate URL protocol - enforce HTTPS
    if (!url.startsWith('https://')) {
      throw new Error('Only HTTPS connections are allowed for security');
    }
    
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
        debugLog(`Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${delay}ms...`);
        
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
    };
  }

  /**
   * Process wildfire data
   */
  processWildfires(wildfires) {
    return wildfires.map(fire => {
      // Validate coordinates
      const lat = parseFloat(fire.latitude);
      const lon = parseFloat(fire.longitude);
      
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        debugError(`Invalid coordinates for fire ${fire.fire_id}: ${lat}, ${lon}`);
        // Skip this fire or use default location
        return null;
      }
      
      // Use our location utilities to get proper fire location
      const location = getFireLocation(fire);
      
      return {
        ...fire,
        latitude: lat,
        longitude: lon,
        displayName: location.primary, // Use the properly calculated location name
        locationDetails: location, // Store full location info for potential use
        statusColor: this.getStatusColor(fire.status),
        sizeCategory: this.getSizeCategory(fire.size_hectares),
      };
    }).filter(fire => fire !== null); // Remove invalid fires
  }


  /**
   * Get status color for wildfire
   */
  getStatusColor(status) {
    const colors = {
      'OC': '#FF0000',  // Red - Out of Control
      'BH': '#FF9800',  // Orange - Being Held
      'UC': '#4CAF50',  // Green - Under Control
      'OUT': '#9E9E9E', // Grey - Extinguished
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
      debugError('Error storing data:', error);
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
      debugError('Error retrieving stored data:', error);
    }
    return null;
  }

  /**
   * Get fallback data for when everything fails
   */
  getFallbackData() {
    return {
      wildfires: [],
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
      debugError('Error fetching metadata:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new DataService();
