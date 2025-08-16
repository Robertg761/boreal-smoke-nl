// Test script to debug fire location naming issues
import locationUtils from './src/utils/locationUtils.js';
const { getFireLocation, calculateDistance } = locationUtils;

// Test cases based on user feedback
// Testing fires that are NEAR locations, not exactly AT them
const testFires = [
  { 
    name: "Fire 2km from Holyrood (should be Holyrood, not Colliers)",
    // Slightly offset from Holyrood's exact coordinates
    latitude: 47.4000,  // ~2km from Holyrood
    longitude: -53.1200,
    expected: "Holyrood"
  },
  {
    name: "Fire at Grand Falls-Windsor (should be GFW, not Millertown Junction)",
    // Slightly offset from GFW
    latitude: 49.0800,
    longitude: -55.6600,
    expected: "Grand Falls-Windsor"
  },
  {
    name: "Paddy's Pond Fire",
    latitude: 47.4650,
    longitude: -52.8978,
    expected: "Paddy's Pond"
  },
  {
    name: "Fire between Holyrood and Colliers",
    // Midpoint between the two
    latitude: 47.4020,
    longitude: -53.1178,
    expected: "Should pick closest or most significant"
  }
];

// Known locations for reference
const locations = [
  { lat: 47.3875, lon: -53.1356, name: 'Holyrood', type: 'town' },
  { lat: 47.4167, lon: -53.1000, name: 'Colliers', type: 'town' },
  { lat: 49.0919, lon: -55.6514, name: 'Grand Falls-Windsor', type: 'town' },
  { lat: 49.0000, lon: -55.7833, name: 'Millertown Junction', type: 'community' },
  { lat: 47.4650, lon: -52.8978, name: "Paddy's Pond", type: 'landmark' },
  { lat: 47.8667, lon: -53.0500, name: 'Gull Island', type: 'community' },
];

console.log("Testing Fire Location Naming\n");
console.log("=" . repeat(50));

testFires.forEach(fire => {
  console.log(`\nTest: ${fire.name}`);
  console.log(`Coordinates: ${fire.latitude}, ${fire.longitude}`);
  console.log(`Expected: ${fire.expected}`);
  
  // Get the fire location
  const location = getFireLocation(fire);
  console.log(`Actual Result: ${location.primary}`);
  
  // Calculate distances to key locations for debugging
  console.log("\nDistances to nearby places:");
  locations.forEach(loc => {
    const distance = calculateDistance(fire.latitude, fire.longitude, loc.lat, loc.lon);
    console.log(`  ${loc.name}: ${distance.toFixed(2)} km`);
  });
  
  console.log("-" . repeat(50));
});
