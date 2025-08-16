const fs = require('fs');

// Read the test data
const testData = JSON.parse(fs.readFileSync('test_data.json', 'utf8'));

// Sample test of fires near known locations
const testFires = [
  { fire_id: 'holyrood_test', latitude: 47.3875, longitude: -53.1356, fire_name: 'Test Holyrood' },  // Exact Holyrood location
  { fire_id: 'grand_falls_test', latitude: 49.0919, longitude: -55.6514, fire_name: 'Test Grand Falls' },  // Exact Grand Falls location
  { fire_id: 'twillingate_test', latitude: 49.6833, longitude: -54.8667, fire_name: 'Test Twillingate' },  // Exact Twillingate location
];

// Add actual fires from the data
if (testData.wildfires && testData.wildfires.length > 0) {
  testFires.push(...testData.wildfires.slice(0, 10));  // Add first 10 real fires
}

// Now let's trace through what our function would do
testFires.forEach(fire => {
  console.log(`\nFire ID: ${fire.fire_id}`);
  console.log(`Coords: ${fire.latitude.toFixed(4)}, ${fire.longitude.toFixed(4)}`);
  console.log(`Raw Name: ${fire.fire_name}`);
  
  // Since we can't import the module directly, let's calculate the expected behavior
  // We need to find the nearest landmark from our list
  console.log('Expected behavior: Should show nearest community');
});
