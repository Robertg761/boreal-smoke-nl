import json

# Load the data
with open('temp_data.json', 'r') as f:
    data = json.load(f)

fires = data.get('wildfires', [])
print(f"Total fires in data: {len(fires)}")
print("\nFirst 10 fires:")
print("-" * 80)

for fire in fires[:10]:
    agency = fire.get('agency', 'N/A')
    lat = fire['latitude']
    lon = fire['longitude']
    fire_id = fire['fire_id']
    
    # Check if in NL bounds
    in_nl = (46.5 <= lat <= 60.5 and -67.5 <= lon <= -52.5)
    
    print(f"ID: {fire_id}")
    print(f"  Agency: {agency}")
    print(f"  Location: {lat:.2f}°N, {lon:.2f}°W")
    print(f"  In NL bounds: {in_nl}")
    print()

# Count by agency
agencies = {}
for fire in fires:
    agency = fire.get('agency', 'Unknown')
    agencies[agency] = agencies.get(agency, 0) + 1

print("\nFires by agency:")
for agency, count in sorted(agencies.items()):
    print(f"  {agency}: {count}")

# Check for non-NL fires
non_nl = []
for fire in fires:
    lat = fire['latitude']
    lon = fire['longitude']
    if not (46.5 <= lat <= 60.5 and -67.5 <= lon <= -52.5):
        non_nl.append(fire)

if non_nl:
    print(f"\n⚠️ Found {len(non_nl)} fires outside NL bounds!")
    for fire in non_nl[:5]:
        print(f"  {fire['fire_id']}: {fire.get('agency', 'N/A')} at {fire['latitude']:.2f}°N, {fire['longitude']:.2f}°W")
else:
    print("\n✓ All fires are within NL bounds")
