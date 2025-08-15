/**
 * Location Utilities
 * Functions for working with geographic locations and providing user-friendly descriptions
 */

// Major regions in Newfoundland
const REGIONS = {
  AVALON: {
    name: 'Avalon Peninsula',
    bounds: { minLat: 46.5, maxLat: 48.5, minLon: -54.0, maxLon: -52.5 },
  },
  EASTERN: {
    name: 'Eastern Newfoundland',
    bounds: { minLat: 47.5, maxLat: 49.5, minLon: -54.5, maxLon: -52.5 },
  },
  CENTRAL: {
    name: 'Central Newfoundland',
    bounds: { minLat: 48.0, maxLat: 50.0, minLon: -57.0, maxLon: -54.5 },
  },
  WESTERN: {
    name: 'Western Newfoundland',
    bounds: { minLat: 47.5, maxLat: 51.5, minLon: -59.5, maxLon: -57.0 },
  },
  NORTHERN: {
    name: 'Northern Peninsula',
    bounds: { minLat: 49.5, maxLat: 52.0, minLon: -58.0, maxLon: -55.5 },
  },
  LABRADOR: {
    name: 'Labrador',
    bounds: { minLat: 51.5, maxLat: 60.0, minLon: -65.0, maxLon: -56.0 },
  },
};

// Known landmarks and reference points
const LANDMARKS = [
  { lat: 47.5615, lon: -52.7126, name: "St. John's", type: 'city' },
  { lat: 48.9509, lon: -54.6159, name: 'Gander', type: 'town' },
  { lat: 49.0919, lon: -55.6514, name: 'Grand Falls-Windsor', type: 'town' },
  { lat: 48.9464, lon: -57.9493, name: 'Corner Brook', type: 'city' },
  { lat: 48.3505, lon: -53.9823, name: 'Clarenville', type: 'town' },
  { lat: 47.7369, lon: -53.2144, name: 'Carbonear', type: 'town' },
  { lat: 47.5989, lon: -53.2644, name: 'Bay Roberts', type: 'town' },
  { lat: 49.2331, lon: -57.4296, name: 'Deer Lake', type: 'town' },
  { lat: 51.4222, lon: -56.0614, name: 'St. Anthony', type: 'town' },
  { lat: 50.2167, lon: -58.9667, name: 'Port aux Basques', type: 'town' },
  { lat: 46.8136, lon: -53.3478, name: 'Cape Race', type: 'landmark' },
  { lat: 47.5717, lon: -59.1367, name: 'Cape Ray', type: 'landmark' },
  { lat: 49.6500, lon: -54.8000, name: 'Terra Nova National Park', type: 'park' },
  { lat: 49.5500, lon: -57.7500, name: 'Gros Morne National Park', type: 'park' },
];

/**
 * Get the region name for a given coordinate
 */
const getRegion = (lat, lon) => {
  for (const [key, region] of Object.entries(REGIONS)) {
    const { bounds } = region;
    if (lat >= bounds.minLat && lat <= bounds.maxLat && 
        lon >= bounds.minLon && lon <= bounds.maxLon) {
      return region.name;
    }
  }
  return 'Newfoundland and Labrador';
};

/**
 * Calculate distance between two points (in km)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Get cardinal direction from one point to another
 */
const getDirection = (fromLat, fromLon, toLat, toLon) => {
  const dLon = toLon - fromLon;
  const dLat = toLat - fromLat;
  const angle = Math.atan2(dLon, dLat) * 180 / Math.PI;
  
  const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

/**
 * Find nearest landmark to a location
 */
const getNearestLandmark = (lat, lon) => {
  let nearest = null;
  let minDistance = Infinity;
  
  for (const landmark of LANDMARKS) {
    const distance = calculateDistance(lat, lon, landmark.lat, landmark.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...landmark, distance };
    }
  }
  
  return nearest;
};

/**
 * Get a user-friendly location description
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} name - Optional location name
 * @returns {object} Location description with various formats
 */
export const getLocationDescription = (lat, lon, name = null) => {
  // If we have a proper name, use it as primary
  if (name && !name.startsWith('Location')) {
    const region = getRegion(lat, lon);
    const nearest = getNearestLandmark(lat, lon);
    
    // Check if this IS a landmark
    const isLandmark = LANDMARKS.some(l => 
      Math.abs(l.lat - lat) < 0.01 && Math.abs(l.lon - lon) < 0.01
    );
    
    if (isLandmark) {
      return {
        primary: name,
        secondary: region,
        detailed: `${name}, ${region}`,
        coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`,
      };
    }
    
    // For other named locations
    return {
      primary: name,
      secondary: nearest.distance < 50 ? 
        `Near ${nearest.name}` : 
        region,
      detailed: nearest.distance < 10 ? 
        `${name} (${Math.round(nearest.distance)}km from ${nearest.name})` :
        `${name}, ${region}`,
      coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`,
    };
  }
  
  // For unnamed locations, provide relative description
  const region = getRegion(lat, lon);
  const nearest = getNearestLandmark(lat, lon);
  
  if (nearest.distance < 5) {
    // Very close to a landmark
    return {
      primary: `Near ${nearest.name}`,
      secondary: region,
      detailed: `${Math.round(nearest.distance)}km from ${nearest.name}`,
      coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`,
    };
  } else if (nearest.distance < 30) {
    // Reasonably close to a landmark
    const direction = getDirection(nearest.lat, nearest.lon, lat, lon);
    return {
      primary: `${Math.round(nearest.distance)}km ${direction} of ${nearest.name}`,
      secondary: region,
      detailed: `${Math.round(nearest.distance)}km ${direction} of ${nearest.name}, ${region}`,
      coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`,
    };
  } else {
    // Far from landmarks, use region
    return {
      primary: region,
      secondary: `${Math.round(nearest.distance)}km from ${nearest.name}`,
      detailed: `${region} (nearest: ${nearest.name})`,
      coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`,
    };
  }
};

/**
 * Format fire location for display
 */
export const getFireLocation = (fire) => {
  // Handle cases where fire_name is null or not useful
  let fireName = null;
  if (fire.fire_name && fire.fire_name !== 'null' && fire.fire_name.trim() !== '') {
    fireName = fire.fire_name;
  } else if (fire.displayName && !fire.displayName.startsWith('Fire ')) {
    fireName = fire.displayName;
  }
  
  const location = getLocationDescription(
    fire.latitude, 
    fire.longitude, 
    fireName
  );
  
  // If we don't have a proper fire name, use Fire ID
  if (!fireName) {
    location.primary = `Fire #${fire.fire_id || 'Unknown'}`;
  } else if (!fireName.includes('Fire')) {
    location.primary = `${fireName} Fire`;
  }
  
  return location;
};

/**
 * Format distance for display
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
};

/**
 * Get relative position between two locations
 */
export const getRelativePosition = (fromLat, fromLon, toLat, toLon) => {
  const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
  const direction = getDirection(fromLat, fromLon, toLat, toLon);
  
  return {
    distance,
    direction,
    description: `${formatDistance(distance)} ${direction}`,
  };
};

export default {
  getLocationDescription,
  getFireLocation,
  formatDistance,
  getRelativePosition,
  calculateDistance,
  getDirection,
  getRegion,
  getNearestLandmark,
};
