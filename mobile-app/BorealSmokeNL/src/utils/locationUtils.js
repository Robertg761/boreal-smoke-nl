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
  // Avalon Peninsula - St. John's Metro
  { lat: 47.5615, lon: -52.7126, name: "St. John's", type: 'city' },
  { lat: 47.5189, lon: -52.8061, name: 'Mount Pearl', type: 'city' },
  { lat: 47.5297, lon: -52.9547, name: 'Conception Bay South', type: 'town' },
  { lat: 47.5361, lon: -52.8579, name: 'Paradise', type: 'town' },
  { lat: 47.4816, lon: -52.7971, name: 'Torbay', type: 'town' },
  { lat: 47.6314, lon: -52.7355, name: 'Portugal Cove-St. Philips', type: 'town' },
  { lat: 47.5933, lon: -52.6808, name: 'Logy Bay', type: 'community' },
  { lat: 47.6167, lon: -52.6833, name: 'Outer Cove', type: 'community' },
  { lat: 47.6333, lon: -52.6667, name: 'Middle Cove', type: 'community' },
  { lat: 47.4650, lon: -52.8978, name: "Paddy's Pond", type: 'landmark' },
  { lat: 47.5875, lon: -52.8875, name: 'Chamberlains', type: 'community' },
  { lat: 47.5542, lon: -52.9125, name: 'Manuels', type: 'community' },
  { lat: 47.5444, lon: -52.9403, name: 'Long Pond', type: 'community' },
  { lat: 47.5667, lon: -52.9500, name: 'Kelligrews', type: 'community' },
  { lat: 47.5833, lon: -52.9667, name: 'Foxtrap', type: 'community' },
  { lat: 47.5181, lon: -52.9800, name: 'Upper Gullies', type: 'community' },
  { lat: 47.4833, lon: -52.7833, name: 'The Goulds', type: 'community' },
  { lat: 47.5000, lon: -52.7500, name: 'Kilbride', type: 'community' },
  { lat: 47.4500, lon: -52.8167, name: 'Shea Heights', type: 'community' },
  { lat: 47.6000, lon: -52.7333, name: 'Bauline', type: 'town' },
  { lat: 47.7167, lon: -52.7833, name: 'Pouch Cove', type: 'town' },
  { lat: 47.7500, lon: -52.8333, name: 'Flatrock', type: 'town' },
  
  // Avalon - Conception Bay
  { lat: 47.3875, lon: -53.1356, name: 'Holyrood', type: 'town' },
  { lat: 47.4333, lon: -53.2167, name: 'Harbour Main', type: 'town' },
  { lat: 47.4500, lon: -53.2333, name: 'Chapel Arm', type: 'community' },
  { lat: 47.4667, lon: -53.2500, name: 'Lakeview', type: 'community' },
  { lat: 47.4333, lon: -53.1667, name: 'Avondale', type: 'town' },
  { lat: 47.4167, lon: -53.1000, name: 'Colliers', type: 'town' },
  { lat: 47.3833, lon: -53.0667, name: 'Conception Harbour', type: 'town' },
  { lat: 47.6000, lon: -53.0500, name: 'Brigus', type: 'town' },
  { lat: 47.5500, lon: -53.0667, name: 'Cupids', type: 'town' },
  { lat: 47.5333, lon: -53.0833, name: 'South River', type: 'community' },
  { lat: 47.5667, lon: -53.1000, name: 'Clarke\'s Beach', type: 'town' },
  { lat: 47.5833, lon: -53.1167, name: 'North River', type: 'town' },
  { lat: 47.6167, lon: -53.1333, name: 'Port de Grave', type: 'town' },
  { lat: 47.6333, lon: -53.1500, name: 'Bareneed', type: 'community' },
  { lat: 47.6500, lon: -53.1667, name: 'Blow Me Down', type: 'community' },
  { lat: 47.5989, lon: -53.2644, name: 'Bay Roberts', type: 'town' },
  { lat: 47.5833, lon: -53.2833, name: 'Spaniards Bay', type: 'town' },
  { lat: 47.5667, lon: -53.3000, name: 'Upper Island Cove', type: 'town' },
  { lat: 47.6167, lon: -53.2167, name: 'Bishop\'s Cove', type: 'community' },
  { lat: 47.6333, lon: -53.2333, name: 'Bryant\'s Cove', type: 'town' },
  { lat: 47.6500, lon: -53.2500, name: 'Harbour Grace South', type: 'community' },
  { lat: 47.7050, lon: -53.2144, name: 'Harbour Grace', type: 'town' },
  { lat: 47.7369, lon: -53.2144, name: 'Carbonear', type: 'town' },
  { lat: 47.7167, lon: -53.1833, name: 'Victoria', type: 'town' },
  { lat: 47.7000, lon: -53.1667, name: 'Salmon Cove', type: 'town' },
  { lat: 47.7333, lon: -53.1500, name: 'Freshwater', type: 'community' },
  { lat: 47.7500, lon: -53.3000, name: 'Bristol\'s Hope', type: 'community' },
  
  // Avalon - Southern Shore
  { lat: 47.3161, lon: -52.9479, name: 'Petty Harbour-Maddox Cove', type: 'town' },
  { lat: 47.2653, lon: -52.9406, name: 'Bay Bulls', type: 'town' },
  { lat: 47.1667, lon: -52.8333, name: 'Witless Bay', type: 'town' },
  { lat: 47.1500, lon: -52.8500, name: 'Mobile', type: 'community' },
  { lat: 47.1333, lon: -52.8667, name: 'Tors Cove', type: 'town' },
  { lat: 47.1167, lon: -52.8833, name: 'La Manche', type: 'community' },
  { lat: 47.1000, lon: -52.9000, name: 'Burnt Cove', type: 'community' },
  { lat: 47.0833, lon: -52.9167, name: 'Bauline East', type: 'community' },
  { lat: 47.0714, lon: -52.8814, name: 'Ferryland', type: 'town' },
  { lat: 47.0167, lon: -52.8500, name: 'Aquaforte', type: 'town' },
  { lat: 47.0000, lon: -52.8333, name: 'Port Kirwan', type: 'community' },
  { lat: 47.0000, lon: -52.8667, name: 'Fermeuse', type: 'town' },
  { lat: 46.9833, lon: -52.8833, name: 'Renews', type: 'town' },
  { lat: 46.9667, lon: -52.9000, name: 'Cappahayden', type: 'community' },
  { lat: 46.8833, lon: -52.9500, name: 'Trepassey', type: 'town' },
  { lat: 46.7333, lon: -53.0667, name: 'Portugal Cove South', type: 'community' },
  { lat: 46.7167, lon: -53.0833, name: 'Biscay Bay', type: 'community' },
  { lat: 46.8667, lon: -53.3667, name: 'St. Shotts', type: 'community' },
  { lat: 46.9500, lon: -53.5333, name: 'St. Mary\'s', type: 'town' },
  { lat: 46.9167, lon: -53.5833, name: 'Riverhead', type: 'community' },
  { lat: 46.9333, lon: -53.5500, name: 'Admiral\'s Beach', type: 'community' },
  { lat: 47.0167, lon: -53.4500, name: 'St. Joseph\'s', type: 'community' },
  { lat: 47.0333, lon: -53.4333, name: 'Mount Carmel', type: 'town' },
  { lat: 47.0500, lon: -53.4167, name: 'Mitchell\'s Brook', type: 'community' },
  { lat: 47.1333, lon: -53.3667, name: 'Colinet', type: 'town' },
  { lat: 47.1667, lon: -53.3333, name: 'Harricott', type: 'community' },
  { lat: 47.2000, lon: -53.3000, name: 'St. Catherine\'s', type: 'community' },
  { lat: 47.2167, lon: -53.5833, name: 'Branch', type: 'town' },
  { lat: 47.2500, lon: -53.6333, name: 'Point Lance', type: 'community' },
  { lat: 47.1833, lon: -53.6167, name: 'St. Bride\'s', type: 'community' },
  { lat: 47.3333, lon: -53.6167, name: 'Placentia', type: 'town' },
  { lat: 47.2833, lon: -53.6333, name: 'Jerseyside', type: 'community' },
  { lat: 47.2667, lon: -53.6500, name: 'Freshwater', type: 'community' },
  { lat: 47.2500, lon: -53.6667, name: 'Dunville', type: 'community' },
  { lat: 47.3667, lon: -53.7000, name: 'Argentia', type: 'community' },
  { lat: 47.3000, lon: -53.8833, name: 'Ship Harbour', type: 'community' },
  { lat: 47.2833, lon: -53.9000, name: 'Fox Harbour', type: 'community' },
  { lat: 47.3333, lon: -53.9833, name: 'Long Harbour', type: 'community' },
  { lat: 47.4333, lon: -53.3667, name: 'Whitbourne', type: 'town' },
  { lat: 47.5167, lon: -53.5333, name: 'Markland', type: 'community' },
  { lat: 47.6500, lon: -53.4500, name: 'Whiteway', type: 'town' },
  { lat: 47.6667, lon: -53.4667, name: 'Green\'s Harbour', type: 'community' },
  { lat: 47.7000, lon: -53.4500, name: 'Heart\'s Delight', type: 'town' },
  { lat: 47.7167, lon: -53.4333, name: 'Islington', type: 'community' },
  { lat: 47.6833, lon: -53.5000, name: 'Heart\'s Desire', type: 'town' },
  { lat: 47.7167, lon: -53.4833, name: 'Heart\'s Content', type: 'town' },
  { lat: 47.6667, lon: -53.4167, name: 'Cavendish', type: 'town' },
  { lat: 47.6333, lon: -53.3833, name: 'New Chelsea', type: 'community' },
  { lat: 47.6167, lon: -53.3667, name: 'New Perlican', type: 'town' },
  { lat: 47.6000, lon: -53.3500, name: 'Winterton', type: 'town' },
  { lat: 47.5833, lon: -53.3333, name: 'Hant\'s Harbour', type: 'town' },
  { lat: 47.8333, lon: -53.2667, name: 'Old Perlican', type: 'town' },
  { lat: 47.8667, lon: -53.0500, name: 'Gull Island', type: 'community' },
  { lat: 47.8833, lon: -53.0667, name: 'Northern Bay', type: 'community' },
  { lat: 47.9000, lon: -53.0833, name: 'Ochre Pit Cove', type: 'town' },
  { lat: 47.9167, lon: -53.1000, name: 'Western Bay', type: 'town' },
  { lat: 47.9333, lon: -53.1167, name: 'Adam\'s Cove', type: 'community' },
  { lat: 47.9500, lon: -53.1333, name: 'Blackhead', type: 'community' },
  { lat: 47.9667, lon: -53.1500, name: 'Broad Cove', type: 'community' },
  { lat: 47.9833, lon: -53.1667, name: 'Small Point', type: 'community' },
  { lat: 47.8000, lon: -54.2833, name: 'Bay de Verde', type: 'town' },
  { lat: 47.8167, lon: -54.2667, name: 'Red Head Cove', type: 'community' },
  { lat: 47.8333, lon: -54.2500, name: 'Grates Cove', type: 'community' },
  { lat: 47.8500, lon: -54.2333, name: 'Caplin Cove', type: 'community' },
  { lat: 47.8667, lon: -54.2167, name: 'Low Point', type: 'community' },
  { lat: 47.8833, lon: -54.2000, name: 'Burnt Point', type: 'community' },
  
  // Central NL - Bonavista Peninsula & Discovery Trail
  { lat: 48.5764, lon: -53.8794, name: 'Bonavista', type: 'town' },
  { lat: 48.3678, lon: -53.3469, name: 'Trinity', type: 'town' },
  { lat: 48.5333, lon: -53.5833, name: 'Catalina', type: 'town' },
  { lat: 48.5167, lon: -53.6000, name: 'Little Catalina', type: 'community' },
  { lat: 48.5000, lon: -53.6167, name: 'Melrose', type: 'community' },
  { lat: 48.4833, lon: -53.6333, name: 'Port Rexton', type: 'town' },
  { lat: 48.4667, lon: -53.6500, name: 'Trinity East', type: 'community' },
  { lat: 48.4500, lon: -53.6667, name: 'Dunfield', type: 'community' },
  { lat: 48.4333, lon: -53.7000, name: 'Lethbridge', type: 'community' },
  { lat: 48.4167, lon: -53.7167, name: 'Brooklyn', type: 'community' },
  { lat: 48.4000, lon: -53.7333, name: 'Portland', type: 'community' },
  { lat: 48.3833, lon: -53.7500, name: 'Jamestown', type: 'community' },
  { lat: 48.5167, lon: -53.9167, name: 'Port Union', type: 'town' },
  { lat: 48.5000, lon: -53.8333, name: 'Maberly', type: 'community' },
  { lat: 48.4833, lon: -53.8500, name: 'Elliston', type: 'town' },
  { lat: 48.4667, lon: -53.8667, name: 'Sandy Cove', type: 'community' },
  { lat: 48.5500, lon: -53.9000, name: 'Newman\'s Cove', type: 'community' },
  { lat: 48.5333, lon: -53.9167, name: 'Amherst Cove', type: 'community' },
  { lat: 48.5667, lon: -53.9333, name: 'Red Cliff', type: 'community' },
  { lat: 48.5833, lon: -53.9500, name: 'Tickle Cove', type: 'community' },
  { lat: 48.6000, lon: -53.9667, name: 'Open Hall', type: 'community' },
  { lat: 48.6167, lon: -53.9833, name: 'Plate Cove West', type: 'community' },
  { lat: 48.6333, lon: -54.0000, name: 'Plate Cove East', type: 'community' },
  { lat: 48.6500, lon: -54.0167, name: 'King\'s Cove', type: 'town' },
  { lat: 48.6667, lon: -54.0333, name: 'Knight\'s Cove', type: 'community' },
  { lat: 48.6833, lon: -54.0500, name: 'Stock Cove', type: 'community' },
  { lat: 48.7000, lon: -54.0667, name: 'Duntara', type: 'community' },
  { lat: 48.7167, lon: -54.0833, name: 'Keels', type: 'town' },
  { lat: 48.4833, lon: -53.9667, name: 'Summerville', type: 'community' },
  { lat: 48.4667, lon: -53.9833, name: 'Princeton', type: 'community' },
  { lat: 48.4500, lon: -54.0000, name: 'Southern Bay', type: 'town' },
  { lat: 48.4333, lon: -54.0167, name: 'Charleston', type: 'community' },
  { lat: 48.4167, lon: -54.0333, name: 'Sweet Bay', type: 'community' },
  { lat: 48.3500, lon: -54.1500, name: 'Lethbridge', type: 'town' },
  { lat: 48.3333, lon: -54.1667, name: 'Hillview', type: 'community' },
  { lat: 48.3167, lon: -54.1833, name: 'Musgravetown', type: 'town' },
  { lat: 48.3000, lon: -54.2000, name: 'Bloomfield', type: 'community' },
  { lat: 48.2833, lon: -54.2167, name: 'Bunyan\'s Cove', type: 'community' },
  { lat: 48.2667, lon: -54.2333, name: 'Cannings Cove', type: 'community' },
  { lat: 48.2500, lon: -54.2500, name: 'Upper Amherst Cove', type: 'community' },
  { lat: 48.6833, lon: -53.9667, name: 'Port Blandford', type: 'town' },
  { lat: 48.8500, lon: -54.1500, name: 'Charlottetown', type: 'town' },
  { lat: 48.8333, lon: -54.1333, name: 'St. Jones Within', type: 'community' },
  { lat: 48.7333, lon: -54.1167, name: 'Burgoyne\'s Cove', type: 'community' },
  { lat: 48.7167, lon: -54.1000, name: 'Newman Sound', type: 'community' },
  
  // Central NL - Terra Nova & Random Island
  { lat: 48.5000, lon: -54.2000, name: 'Random Island', type: 'landmark' },
  { lat: 48.4167, lon: -54.0667, name: 'Hickman\'s Harbour', type: 'community' },
  { lat: 48.4000, lon: -54.0833, name: 'Lady Cove', type: 'community' },
  { lat: 48.3833, lon: -54.1000, name: 'Britannia', type: 'community' },
  { lat: 48.3667, lon: -54.1167, name: 'Snook\'s Harbour', type: 'community' },
  { lat: 48.3500, lon: -54.1333, name: 'Petley', type: 'community' },
  { lat: 48.5500, lon: -54.2500, name: 'Terra Nova', type: 'community' },
  { lat: 48.5833, lon: -54.2667, name: 'Sandringham', type: 'community' },
  { lat: 48.6000, lon: -54.2833, name: 'Eastport', type: 'town' },
  { lat: 48.6167, lon: -54.3000, name: 'Happy Adventure', type: 'town' },
  { lat: 48.6333, lon: -54.3167, name: 'Sandy Cove', type: 'community' },
  { lat: 48.6500, lon: -54.3333, name: 'Salvage', type: 'town' },
  { lat: 48.6667, lon: -54.3500, name: 'St. Chad\'s', type: 'community' },
  { lat: 48.6833, lon: -54.3667, name: 'Burnside', type: 'community' },
  { lat: 48.7000, lon: -54.3833, name: 'St. Brendan\'s', type: 'town' },
  { lat: 48.3505, lon: -53.9823, name: 'Clarenville', type: 'town' },
  { lat: 48.3333, lon: -53.9667, name: 'Shoal Harbour', type: 'town' },
  { lat: 48.3167, lon: -53.9500, name: 'George\'s Brook', type: 'community' },
  { lat: 48.3000, lon: -53.9333, name: 'Milton', type: 'community' },
  { lat: 48.2833, lon: -53.9167, name: 'Harcourt', type: 'community' },
  { lat: 48.2667, lon: -53.9000, name: 'Monroe', type: 'community' },
  { lat: 48.2500, lon: -53.8833, name: 'Thorburn Lake', type: 'community' },
  
  // Central NL - Gander to Twillingate
  { lat: 48.9509, lon: -54.6159, name: 'Gander', type: 'town' },
  { lat: 48.9333, lon: -54.5833, name: 'Gander Bay', type: 'town' },
  { lat: 48.9667, lon: -54.5500, name: 'Victoria Cove', type: 'community' },
  { lat: 48.9833, lon: -54.5333, name: 'Fredericton', type: 'community' },
  { lat: 49.0000, lon: -54.5167, name: 'Main Point', type: 'community' },
  { lat: 49.0167, lon: -54.5000, name: 'Davidsville', type: 'community' },
  { lat: 49.0333, lon: -54.4833, name: 'Rodgers Cove', type: 'community' },
  { lat: 48.9500, lon: -54.5667, name: 'Carmanville', type: 'town' },
  { lat: 48.9667, lon: -53.9667, name: 'Hare Bay', type: 'town' },
  { lat: 49.1167, lon: -53.5667, name: 'Musgrave Harbour', type: 'town' },
  { lat: 49.1000, lon: -53.5500, name: 'Doting Cove', type: 'community' },
  { lat: 49.0833, lon: -53.5333, name: 'Ragged Harbour', type: 'community' },
  { lat: 49.1333, lon: -53.6167, name: 'Deadman\'s Bay', type: 'town' },
  { lat: 49.1500, lon: -53.6333, name: 'Valleyfield', type: 'town' },
  { lat: 49.1667, lon: -53.6500, name: 'Badger\'s Quay', type: 'town' },
  { lat: 49.1833, lon: -53.6667, name: 'Pool\'s Island', type: 'community' },
  { lat: 49.2000, lon: -53.6833, name: 'Wesleyville', type: 'town' },
  { lat: 49.2167, lon: -53.7000, name: 'Newtown', type: 'town' },
  { lat: 49.2333, lon: -53.7167, name: 'Pound Cove', type: 'community' },
  { lat: 49.2500, lon: -53.7333, name: 'Templeman', type: 'community' },
  { lat: 49.2667, lon: -53.7500, name: 'Cape Freels', type: 'community' },
  { lat: 49.2833, lon: -53.7667, name: 'Lumsden', type: 'town' },
  { lat: 49.3000, lon: -53.7833, name: 'Cat Harbour', type: 'community' },
  { lat: 49.3167, lon: -53.8000, name: 'Straight Shore', type: 'community' },
  { lat: 49.2333, lon: -55.0500, name: 'Gambo', type: 'town' },
  { lat: 49.2167, lon: -55.0333, name: 'Middle Brook', type: 'community' },
  { lat: 49.2000, lon: -55.0167, name: 'Hare Bay', type: 'community' },
  { lat: 49.1833, lon: -55.0000, name: 'Dark Cove', type: 'community' },
  { lat: 49.4608, lon: -54.8869, name: 'Glovertown', type: 'town' },
  { lat: 49.4444, lon: -54.8706, name: 'Traytown', type: 'town' },
  { lat: 49.4278, lon: -54.8542, name: 'Cullerville', type: 'community' },
  { lat: 49.4111, lon: -54.8378, name: 'Sandy Cove', type: 'community' },
  { lat: 49.3944, lon: -54.8214, name: 'Salvage', type: 'community' },
  { lat: 49.3778, lon: -54.8050, name: 'Burnside', type: 'community' },
  { lat: 49.3611, lon: -54.7886, name: 'St. Brendan\'s', type: 'community' },
  { lat: 49.3444, lon: -54.7722, name: 'Dover', type: 'town' },
  { lat: 49.3278, lon: -54.7558, name: 'Wellington', type: 'community' },
  { lat: 49.3111, lon: -54.7394, name: 'Hare Bay', type: 'community' },
  { lat: 49.3186, lon: -54.9656, name: 'New-Wes-Valley', type: 'town' },
  { lat: 49.3019, lon: -54.9489, name: 'Greenspond', type: 'town' },
  { lat: 49.2853, lon: -54.9322, name: 'Indian Bay', type: 'community' },
  { lat: 49.2686, lon: -54.9156, name: 'Centreville', type: 'town' },
  { lat: 49.2519, lon: -54.8989, name: 'Trinity Bay North', type: 'community' },
  { lat: 49.2353, lon: -54.8822, name: 'Port Blandford', type: 'community' },
  
  // Central NL - Twillingate & Islands
  { lat: 49.6833, lon: -54.8667, name: 'Twillingate', type: 'town' },
  { lat: 49.6667, lon: -54.8500, name: 'Little Harbour', type: 'community' },
  { lat: 49.6500, lon: -54.8333, name: 'Purcell\'s Harbour', type: 'community' },
  { lat: 49.6333, lon: -54.8167, name: 'Durrell', type: 'community' },
  { lat: 49.6167, lon: -54.8000, name: 'Jenkins Cove', type: 'community' },
  { lat: 49.6000, lon: -54.7833, name: 'Bayview', type: 'community' },
  { lat: 49.5833, lon: -54.7667, name: 'Crow Head', type: 'town' },
  { lat: 49.5667, lon: -54.7500, name: 'Pikes Arm', type: 'community' },
  { lat: 49.5500, lon: -54.7333, name: 'Nippers Harbour', type: 'town' },
  { lat: 49.5333, lon: -54.7167, name: 'Burlington', type: 'community' },
  { lat: 49.5167, lon: -54.7000, name: 'Smith\'s Harbour', type: 'community' },
  { lat: 49.5000, lon: -54.6833, name: 'Indian Cove', type: 'community' },
  { lat: 49.4833, lon: -54.6667, name: 'Round Harbour', type: 'community' },
  { lat: 49.4667, lon: -54.6500, name: 'Snook\'s Arm', type: 'community' },
  { lat: 49.4500, lon: -54.7667, name: 'Fogo', type: 'town' },
  { lat: 49.4333, lon: -54.7500, name: 'Stag Harbour', type: 'community' },
  { lat: 49.4167, lon: -54.7333, name: 'Seldom', type: 'town' },
  { lat: 49.4000, lon: -54.7167, name: 'Little Seldom', type: 'community' },
  { lat: 49.3833, lon: -54.7000, name: 'Island Harbour', type: 'community' },
  { lat: 49.3667, lon: -54.6833, name: 'Deep Bay', type: 'community' },
  { lat: 49.3500, lon: -54.6667, name: 'Shoal Bay', type: 'community' },
  { lat: 49.3333, lon: -54.6500, name: 'Barr\'d Islands', type: 'community' },
  { lat: 49.3167, lon: -54.6333, name: 'Joe Batt\'s Arm', type: 'town' },
  { lat: 49.3000, lon: -54.6167, name: 'Tilting', type: 'town' },
  { lat: 49.7167, lon: -54.7500, name: 'Change Islands', type: 'town' },
  { lat: 49.5833, lon: -55.4667, name: 'Point Leamington', type: 'town' },
  { lat: 49.5667, lon: -55.4500, name: 'Leading Tickles', type: 'town' },
  { lat: 49.5500, lon: -55.4333, name: 'Pleasantview', type: 'community' },
  { lat: 49.5333, lon: -55.4167, name: 'Cottle\'s Island', type: 'community' },
  { lat: 49.5167, lon: -55.4000, name: 'Fortune Harbour', type: 'community' },
  { lat: 49.5000, lon: -55.3833, name: 'Cottlesville', type: 'town' },
  { lat: 49.4833, lon: -55.3667, name: 'Summerford', type: 'town' },
  { lat: 49.4667, lon: -55.3500, name: 'New World Island', type: 'island' },
  { lat: 49.4500, lon: -55.3333, name: 'Virgin Arm', type: 'community' },
  { lat: 49.4333, lon: -55.3167, name: 'Carter\'s Cove', type: 'community' },
  { lat: 49.4167, lon: -55.3000, name: 'Hillgrade', type: 'community' },
  { lat: 49.4000, lon: -55.2833, name: 'Newville', type: 'community' },
  { lat: 49.3833, lon: -55.2667, name: 'Valley Pond', type: 'community' },
  { lat: 49.3667, lon: -55.2500, name: 'Bridgeport', type: 'community' },
  { lat: 49.3500, lon: -55.2333, name: 'Chapel Arm', type: 'community' },
  { lat: 49.3333, lon: -55.2167, name: 'Herring Neck', type: 'town' },
  { lat: 49.3167, lon: -55.2000, name: 'Salt Pond', type: 'community' },
  { lat: 49.3000, lon: -55.1833, name: 'Merritt\'s Harbour', type: 'community' },
  { lat: 49.2833, lon: -55.1667, name: 'Too Good Arm', type: 'community' },
  { lat: 49.2667, lon: -55.1500, name: 'Fairbank', type: 'community' },
  { lat: 49.2500, lon: -55.1333, name: 'Cobb\'s Arm', type: 'community' },
  { lat: 49.2333, lon: -55.1167, name: 'Horwood', type: 'community' },
  { lat: 49.2167, lon: -55.1000, name: 'Stoneville', type: 'community' },
  { lat: 49.2000, lon: -55.0833, name: 'Comfort Cove', type: 'town' },
  { lat: 49.1833, lon: -55.0667, name: 'Newstead', type: 'community' },
  { lat: 49.1667, lon: -55.0500, name: 'Alderburn', type: 'community' },
  { lat: 49.1500, lon: -55.0333, name: 'Campbellton', type: 'town' },
  { lat: 49.1333, lon: -55.0167, name: 'Birchy Bay', type: 'town' },
  { lat: 49.1167, lon: -55.0000, name: 'Loon Bay', type: 'town' },
  { lat: 49.1000, lon: -54.9833, name: 'Boyd\'s Cove', type: 'town' },
  { lat: 49.0833, lon: -54.9667, name: 'Michael\'s Harbour', type: 'community' },
  { lat: 49.0667, lon: -54.9500, name: 'Laurenceton', type: 'town' },
  { lat: 49.5500, lon: -55.4500, name: 'Notre Dame Junction', type: 'town' },
  { lat: 49.9333, lon: -55.7667, name: 'Lewisporte', type: 'town' },
  { lat: 49.9167, lon: -55.7500, name: 'Embree', type: 'town' },
  { lat: 49.9000, lon: -55.7333, name: 'Little Burnt Bay', type: 'town' },
  { lat: 49.8833, lon: -55.7167, name: 'St. Michael\'s', type: 'community' },
  { lat: 49.8667, lon: -55.7000, name: 'Stanhope', type: 'community' },
  { lat: 49.8500, lon: -55.6833, name: 'Kite Cove', type: 'community' },
  { lat: 49.8333, lon: -55.6667, name: 'Brown\'s Arm', type: 'town' },
  { lat: 49.8167, lon: -55.6500, name: 'Alton', type: 'community' },
  { lat: 49.8000, lon: -55.6333, name: 'Porterville', type: 'community' },
  { lat: 49.7833, lon: -55.6167, name: 'Lushes Bight', type: 'town' },
  { lat: 49.7667, lon: -55.6000, name: 'Long Island', type: 'community' },
  { lat: 49.7500, lon: -55.5833, name: 'Beaumont', type: 'community' },
  { lat: 49.7333, lon: -55.5667, name: 'Triton', type: 'town' },
  { lat: 49.7167, lon: -55.5500, name: 'Card\'s Harbour', type: 'community' },
  { lat: 49.7000, lon: -55.5333, name: 'Pilley\'s Island', type: 'town' },
  { lat: 49.6833, lon: -55.5167, name: 'Brighton', type: 'community' },
  { lat: 49.6667, lon: -55.5000, name: 'Port Anson', type: 'community' },
  { lat: 49.6500, lon: -55.4833, name: 'Miles Cove', type: 'community' },
  { lat: 49.6333, lon: -55.4667, name: 'Roberts Arm', type: 'town' },
  { lat: 49.6167, lon: -55.4500, name: 'Woody Point', type: 'community' },
  { lat: 49.6000, lon: -55.4333, name: 'Nickey\'s Nose Cove', type: 'community' },
  { lat: 49.6500, lon: -56.1167, name: 'Bishops Falls', type: 'town' },
  { lat: 49.4697, lon: -56.2206, name: 'Botwood', type: 'town' },
  { lat: 49.4531, lon: -56.2039, name: 'Peterview', type: 'town' },
  { lat: 49.4364, lon: -56.1872, name: 'Northern Arm', type: 'town' },
  { lat: 49.0500, lon: -55.8333, name: 'Buchans', type: 'town' },
  { lat: 49.0333, lon: -55.8167, name: 'Buchans Junction', type: 'community' },
  { lat: 49.0167, lon: -55.8000, name: 'Millertown', type: 'town' },
  { lat: 49.0000, lon: -55.7833, name: 'Millertown Junction', type: 'community' },
  { lat: 49.0919, lon: -55.6514, name: 'Grand Falls-Windsor', type: 'town' },
  { lat: 49.0753, lon: -55.6347, name: 'Windsor', type: 'community' },
  { lat: 49.0586, lon: -55.6181, name: 'Grand Falls', type: 'community' },
  { lat: 49.9500, lon: -56.1500, name: 'Springdale', type: 'town' },
  { lat: 49.9333, lon: -56.1333, name: 'Indian Brook', type: 'community' },
  { lat: 49.9167, lon: -56.1167, name: 'South Brook', type: 'town' },
  { lat: 49.9000, lon: -56.1000, name: 'Beachside', type: 'community' },
  { lat: 49.8833, lon: -56.0833, name: 'Hall\'s Bay', type: 'community' },
  { lat: 49.8667, lon: -56.0667, name: 'Little Bay', type: 'town' },
  { lat: 49.8500, lon: -56.0500, name: 'St. Patrick\'s', type: 'community' },
  { lat: 49.8333, lon: -56.0333, name: 'Harry\'s Harbour', type: 'community' },
  { lat: 49.8167, lon: -56.0167, name: 'Jackson\'s Cove', type: 'community' },
  { lat: 49.8000, lon: -56.0000, name: 'Langdon\'s Cove', type: 'community' },
  { lat: 49.7833, lon: -55.9833, name: 'Silverdale', type: 'community' },
  { lat: 49.4833, lon: -56.0833, name: 'Badger', type: 'town' },
  { lat: 49.4667, lon: -56.0667, name: 'Badger\'s Quay', type: 'community' },
  { lat: 49.4500, lon: -56.0500, name: 'Pool\'s Cove', type: 'community' },
  { lat: 49.4333, lon: -56.0333, name: 'Grand Falls Station', type: 'community' },
  { lat: 49.9167, lon: -56.7333, name: 'Baie Verte', type: 'town' },
  { lat: 49.9000, lon: -56.7167, name: 'Seal Cove', type: 'community' },
  { lat: 49.8833, lon: -56.7000, name: 'Wild Cove', type: 'community' },
  { lat: 49.8667, lon: -56.6833, name: 'Westport', type: 'town' },
  { lat: 49.8500, lon: -56.6667, name: 'Purbeck\'s Cove', type: 'community' },
  { lat: 49.8333, lon: -56.6500, name: 'Coachman\'s Cove', type: 'town' },
  { lat: 49.8167, lon: -56.6333, name: 'Fleur de Lys', type: 'town' },
  { lat: 49.8000, lon: -56.6167, name: 'Pacquet', type: 'town' },
  { lat: 49.7833, lon: -56.6000, name: 'Woodstock', type: 'community' },
  { lat: 49.7667, lon: -56.5833, name: 'Ming\'s Bight', type: 'town' },
  { lat: 49.7500, lon: -56.5667, name: 'Cape St. John', type: 'community' },
  { lat: 50.2000, lon: -56.0500, name: 'La Scie', type: 'town' },
  { lat: 50.1833, lon: -56.0333, name: 'Tilt Cove', type: 'community' },
  { lat: 50.1667, lon: -56.0167, name: 'Shoe Cove', type: 'community' },
  { lat: 50.1500, lon: -56.0000, name: 'Nippers Harbour', type: 'town' },
  { lat: 50.1333, lon: -55.9833, name: 'Round Harbour', type: 'community' },
  { lat: 50.1167, lon: -55.9667, name: 'Snook\'s Arm', type: 'town' },
  { lat: 50.1000, lon: -55.9500, name: 'Brent\'s Cove', type: 'community' },
  { lat: 50.0833, lon: -55.9333, name: 'Little Bay Islands', type: 'town' },
  { lat: 50.0667, lon: -55.9167, name: 'Harbour Deep', type: 'community' },
  { lat: 49.9500, lon: -55.2333, name: 'Pilley\'s Island', type: 'town' },
  
  // Western NL
  { lat: 49.0833, lon: -58.1000, name: 'Stephenville', type: 'town' },
  { lat: 48.3333, lon: -58.7167, name: 'Port aux Port', type: 'peninsula' },
  { lat: 49.4500, lon: -57.5833, name: 'Rocky Harbour', type: 'town' },
  { lat: 49.7703, lon: -57.8444, name: 'Norris Point', type: 'town' },
  { lat: 48.5500, lon: -58.4833, name: 'Burgeo', type: 'town' },
  { lat: 47.5833, lon: -58.4833, name: 'Channel-Port aux Basques', type: 'town' },
  
  // Northern Peninsula
  { lat: 50.5667, lon: -57.3333, name: 'Flower\'s Cove', type: 'town' },
  { lat: 50.8500, lon: -56.1500, name: 'Raleigh', type: 'town' },
  { lat: 51.5967, lon: -55.5369, name: "L'Anse aux Meadows", type: 'landmark' },
  
  // Northern Peninsula & Labrador
  { lat: 50.5500, lon: -56.0833, name: 'Englee', type: 'town' },
  { lat: 50.2833, lon: -57.2000, name: 'Roddickton', type: 'town' },
  { lat: 50.9000, lon: -55.8333, name: 'Main Brook', type: 'town' },
  { lat: 51.2167, lon: -56.7667, name: 'St. Barbe', type: 'town' },
  { lat: 50.1500, lon: -56.1333, name: 'Jackson\'s Arm', type: 'town' },
  { lat: 49.9167, lon: -56.8500, name: 'Hampden', type: 'town' },
  { lat: 50.6833, lon: -57.9500, name: 'Hawkes Bay', type: 'town' },
  { lat: 50.8500, lon: -57.1333, name: 'Daniel\'s Harbour', type: 'town' },
  { lat: 49.6000, lon: -58.0333, name: 'Trout River', type: 'town' },
  { lat: 49.9000, lon: -57.9500, name: 'Woody Point', type: 'town' },
  { lat: 53.3167, lon: -60.4167, name: 'Happy Valley-Goose Bay', type: 'town' },
  { lat: 52.9500, lon: -66.9167, name: 'Labrador City', type: 'town' },
  { lat: 52.9167, lon: -66.8667, name: 'Wabush', type: 'town' },
  { lat: 54.8000, lon: -58.5667, name: 'Nain', type: 'town' },
  { lat: 56.5333, lon: -61.6833, name: 'Hopedale', type: 'town' },
  { lat: 55.4333, lon: -60.2167, name: 'Makkovik', type: 'town' },
  { lat: 53.5333, lon: -57.1833, name: 'Rigolet', type: 'town' },
  { lat: 52.3167, lon: -55.7833, name: 'Cartwright', type: 'town' },
  { lat: 52.5667, lon: -56.0000, name: 'Black Tickle', type: 'town' },
  { lat: 51.4833, lon: -57.0667, name: 'Red Bay', type: 'town' },
  { lat: 51.7333, lon: -55.8667, name: 'Forteau', type: 'town' },
  { lat: 51.9000, lon: -55.1667, name: 'Blanc Sablon', type: 'town' },
  
  // Natural Landmarks
  { lat: 46.8136, lon: -53.3478, name: 'Cape Race', type: 'landmark' },
  { lat: 47.5717, lon: -59.1367, name: 'Cape Ray', type: 'landmark' },
  { lat: 48.5500, lon: -54.2500, name: 'Terra Nova National Park', type: 'park' },
  { lat: 49.5500, lon: -57.7500, name: 'Gros Morne National Park', type: 'park' },
  { lat: 47.8000, lon: -54.2833, name: 'Bay de Verde', type: 'town' },
  { lat: 48.5000, lon: -54.2000, name: 'Random Island', type: 'landmark' },
  { lat: 49.5000, lon: -55.8500, name: 'Red Indian Lake', type: 'landmark' },
  { lat: 48.3333, lon: -56.7500, name: 'Grand Lake', type: 'landmark' },
  { lat: 50.0000, lon: -57.2500, name: 'White Bay', type: 'landmark' },
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
 * Find the best nearby landmark considering both distance and importance
 * Prioritizes larger/more significant places when they're reasonably close
 */
const getBestNearbyLandmark = (lat, lon, maxDistance = 50) => {
  // Find all landmarks within maxDistance
  const nearbyLandmarks = [];
  
  for (const landmark of LANDMARKS) {
    const distance = calculateDistance(lat, lon, landmark.lat, landmark.lon);
    if (distance <= maxDistance) {
      nearbyLandmarks.push({ ...landmark, distance });
    }
  }
  
  // If no landmarks within maxDistance, fallback to nearest
  if (nearbyLandmarks.length === 0) {
    return getNearestLandmark(lat, lon);
  }
  
  // Sort by a score that considers both distance and type
  // Lower score is better
  nearbyLandmarks.sort((a, b) => {
    // Type priorities (lower is better)
    const typePriority = {
      'city': 0,
      'town': 1,
      'community': 2,
      'island': 3,
      'landmark': 4,
      'park': 5,
      'peninsula': 6
    };
    
    const aPriority = typePriority[a.type] || 10;
    const bPriority = typePriority[b.type] || 10;
    
    // Calculate scores
    // For very close locations (<5km), distance matters most
    // For moderate distances, type becomes more important
    let aScore, bScore;
    
    if (a.distance < 5 && b.distance < 5) {
      // Very close - distance is most important
      aScore = a.distance + (aPriority * 0.5);
      bScore = b.distance + (bPriority * 0.5);
    } else if (a.distance < 15 && b.distance < 15) {
      // Moderate distance - balance distance and type
      aScore = a.distance + (aPriority * 2);
      bScore = b.distance + (bPriority * 2);
    } else {
      // Farther away - type is more important
      aScore = (a.distance * 0.5) + (aPriority * 5);
      bScore = (b.distance * 0.5) + (bPriority * 5);
    }
    
    return aScore - bScore;
  });
  
  return nearbyLandmarks[0];
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
  // Simply get the nearest landmark for accuracy
  const nearest = getNearestLandmark(fire.latitude, fire.longitude);
  
  // Generate fire name based on location
  let fireName = null;
  
  if (nearest.distance < 3) {
    // Very close to a landmark - use its name directly
    fireName = nearest.name;
  } else if (nearest.distance < 15) {
    // Close enough to reference with direction
    const direction = getDirection(nearest.lat, nearest.lon, fire.latitude, fire.longitude);
    const directionShort = {
      'north': 'N',
      'northeast': 'NE', 
      'east': 'E',
      'southeast': 'SE',
      'south': 'S',
      'southwest': 'SW',
      'west': 'W',
      'northwest': 'NW'
    }[direction];
    fireName = `${nearest.name} ${directionShort}`;
  } else if (nearest.distance < 30) {
    // Include distance for clarity
    const direction = getDirection(nearest.lat, nearest.lon, fire.latitude, fire.longitude);
    const directionShort = {
      'north': 'N',
      'northeast': 'NE', 
      'east': 'E',
      'southeast': 'SE',
      'south': 'S',
      'southwest': 'SW',
      'west': 'W',
      'northwest': 'NW'
    }[direction];
    fireName = `${Math.round(nearest.distance)}km ${directionShort} of ${nearest.name}`;
  } else {
    // Far from landmarks - still reference the nearest one with distance
    const direction = getDirection(nearest.lat, nearest.lon, fire.latitude, fire.longitude);
    const directionShort = {
      'north': 'N',
      'northeast': 'NE', 
      'east': 'E',
      'southeast': 'SE',
      'south': 'S',
      'southwest': 'SW',
      'west': 'W',
      'northwest': 'NW'
    }[direction];
    // Always show nearest community even if far
    fireName = `${Math.round(nearest.distance)}km ${directionShort} of ${nearest.name}`;
  }
  
  // Create location object directly without re-processing through getLocationDescription
  // This avoids the issue where getLocationDescription was overriding our carefully chosen name
  const location = {
    primary: fireName ? `${fireName} Fire` : `Fire #${fire.fire_id || 'Unknown'}`,
    secondary: getRegion(fire.latitude, fire.longitude),
    detailed: `${fireName}, ${getRegion(fire.latitude, fire.longitude)}`,
    coordinates: `${fire.latitude.toFixed(3)}°N, ${Math.abs(fire.longitude).toFixed(3)}°W`,
  };
  
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
