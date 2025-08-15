import json
from datetime import datetime

# Load the generated data
with open('temp_data/data.json', 'r') as f:
    data = json.load(f)

# Filter for NL agency fires
nl_fires = [f for f in data['wildfires'] if f.get('agency') == 'nl']

print(f"Found {len(nl_fires)} fires with NL agency")
print(f"You mentioned there are 8 active wildfires in NL\n")

print("NL Fires Details:")
print("-" * 80)

for i, fire in enumerate(nl_fires, 1):
    fire_id = fire.get('fire_id', 'Unknown')
    size = fire.get('size_hectares', 0)
    status = fire.get('status', 'Unknown')
    start_date = fire.get('start_date', 'Unknown')
    lat = fire.get('latitude', 0)
    lon = fire.get('longitude', 0)
    
    # Parse date if possible
    if start_date != 'Unknown':
        try:
            date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            days_active = (datetime.now() - date_obj.replace(tzinfo=None)).days
            date_str = date_obj.strftime('%Y-%m-%d')
        except:
            days_active = 'Unknown'
            date_str = start_date[:10] if len(start_date) > 10 else start_date
    else:
        days_active = 'Unknown'
        date_str = 'Unknown'
    
    print(f"{i}. Fire ID: {fire_id}")
    print(f"   Size: {size} hectares")
    print(f"   Status: {status}")
    print(f"   Started: {date_str} ({days_active} days ago)")
    print(f"   Location: {lat:.4f}, {lon:.4f}")
    print()

# Check if any might be duplicates or outdated
print("\nFire Status Summary:")
status_counts = {}
for fire in nl_fires:
    status = fire.get('status', 'Unknown')
    status_counts[status] = status_counts.get(status, 0) + 1

for status, count in status_counts.items():
    print(f"  {status}: {count} fires")

# Also check other agencies in the region
other_fires = [f for f in data['wildfires'] if f.get('agency') != 'nl']
other_agencies = set([f.get('agency') for f in other_fires])
print(f"\nAlso found {len(other_fires)} fires from other agencies in the region: {other_agencies}")
