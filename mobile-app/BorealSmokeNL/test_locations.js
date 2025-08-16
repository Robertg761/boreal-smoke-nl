
import * as locationUtils from './src/utils/locationUtils.js';

import testData from './test_data.json' assert { type: 'json' };

testData.wildfires.forEach(fire => {
  const location = locationUtils.getFireLocation(fire);
  console.log(`Fire ID: ${fire.fire_id}`);
  console.log(`  - Coords: ${fire.latitude}, ${fire.longitude}`);
  console.log(`  - Raw Name: ${fire.fire_name}`);
  console.log(`  - Display Name: ${location.primary}`);
  console.log('---');
});

