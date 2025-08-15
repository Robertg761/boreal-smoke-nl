/**
 * Professional Data Service for Boreal Smoke NL
 * This is what users never see - handles all data fetching seamlessly
 */

class AirQualityDataService {
  constructor() {
    // Professional-looking endpoints (users never see these)
    this.endpoints = {
      // Option 1: GitHub Pages (free, reliable)
      primary: 'https://robertg761.github.io/boreal-smoke-nl/data.json',
      
      // Option 2: Custom domain (most professional)
      // primary: 'https://api.borealsmoke.ca/data.json',
      
      // Option 3: CloudFlare CDN (fastest)
      // primary: 'https://cdn.borealsmoke.ca/data.json',
      
      // Fallback endpoint
      fallback: 'https://boreal-smoke-backup.netlify.app/data.json'
    };
    
    this.cache = null;
    this.lastFetch = null;
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get current air quality data
   * Users just see the map update - completely seamless
   */
  async getCurrentData() {
    try {
      // Check if we have recent cached data
      if (this.cache && this.isCacheValid()) {
        return this.cache;
      }

      // Show subtle loading indicator (professional apps do this)
      this.showLoadingIndicator();

      // Fetch fresh data
      const response = await fetch(this.endpoints.primary, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        // Seamlessly fallback to backup endpoint
        return this.fetchFromFallback();
      }

      const data = await response.json();
      
      // Cache for offline use
      this.cache = data;
      this.lastFetch = Date.now();
      await this.saveToLocalStorage(data);

      // Hide loading indicator
      this.hideLoadingIndicator();

      return data;

    } catch (error) {
      // User never sees errors - gracefully use cached data
      console.log('Using cached data');
      return this.getCachedData();
    }
  }

  /**
   * Smart caching for offline support
   * Users can use the app even without internet
   */
  isCacheValid() {
    if (!this.lastFetch) return false;
    const age = Date.now() - this.lastFetch;
    return age < this.updateInterval;
  }

  /**
   * Professional loading state
   * Just a subtle spinner or shimmer effect
   */
  showLoadingIndicator() {
    // Subtle animation in the UI
    // Not intrusive - users barely notice
  }

  /**
   * Auto-refresh in background
   * Users always have fresh data without doing anything
   */
  startAutoRefresh() {
    setInterval(() => {
      this.getCurrentData();
    }, this.updateInterval);
  }
}

/**
 * What the user actually interacts with in the app
 * Clean, simple, professional
 */
class MapScreen extends React.Component {
  async componentDidMount() {
    // Initialize data service
    this.dataService = new AirQualityDataService();
    
    // Get data (happens instantly from user's perspective)
    const data = await this.dataService.getCurrentData();
    
    // Update map with fires and air quality
    this.updateMap(data);
    
    // Start auto-refresh (invisible to user)
    this.dataService.startAutoRefresh();
  }

  updateMap(data) {
    // Beautiful map updates
    this.setState({
      wildfires: data.wildfires,
      airQuality: data.predictions,
      currentAQHI: this.getLocalAQHI(data)
    });
  }

  render() {
    // What users see: A beautiful, professional map interface
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={AVALON_PENINSULA}
        >
          {/* Fire markers */}
          {this.state.wildfires.map(fire => (
            <Marker
              key={fire.id}
              coordinate={{
                latitude: fire.latitude,
                longitude: fire.longitude
              }}
              title={`${fire.size_hectares} hectares`}
            />
          ))}
          
          {/* Smoke overlay - beautiful gradient */}
          <SmokeOverlay data={this.state.airQuality} />
        </MapView>
        
        {/* Clean, professional UI */}
        <View style={styles.infoPanel}>
          <Text style={styles.communityName}>
            {this.state.selectedCommunity}
          </Text>
          <AQHIIndicator value={this.state.currentAQHI} />
          <Text style={styles.updateTime}>
            Updated {this.getTimeAgo()}
          </Text>
        </View>
        
        {/* Timeline slider - smooth and responsive */}
        <TimelineSlider 
          onValueChange={this.onTimeChange}
          hours={12}
        />
      </View>
    );
  }
}

/**
 * Professional features that make it feel polished:
 */

// 1. Smooth animations when data updates
const animateDataUpdate = () => {
  Animated.timing(opacity, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();
};

// 2. Offline support with friendly message
const OfflineNotice = () => (
  <View style={styles.offlineNotice}>
    <Text>Showing cached data (offline)</Text>
  </View>
);

// 3. Smart community detection based on user location
const detectNearestCommunity = async () => {
  const location = await Location.getCurrentPositionAsync();
  return findNearestCommunity(location);
};

// 4. Beautiful loading states
const LoadingShimmer = () => (
  <ShimmerPlaceholder
    visible={!isLoading}
    style={styles.shimmer}
  />
);

// 5. Smooth transitions between forecast hours
const animateTimeChange = (hour) => {
  Animated.spring(mapOverlay, {
    toValue: hour,
    useNativeDriver: true,
  }).start();
};
