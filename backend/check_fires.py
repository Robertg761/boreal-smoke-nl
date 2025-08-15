import requests
import csv
from io import StringIO

# Fetch the CSV data
url = 'https://cwfis.cfs.nrcan.gc.ca/downloads/activefires/activefires.csv'
resp = requests.get(url)
reader = csv.DictReader(StringIO(resp.text))
fires = list(reader)

# Check for NL fires
nl_fires = [f for f in fires if f.get('agency', '').lower() == 'nl']

print(f'Total fires in CSV: {len(fires)}')
print(f'NL fires found: {len(nl_fires)}')
print(f'All unique agencies: {sorted(set([f.get("agency", "Unknown") for f in fires]))}')

if nl_fires:
    print(f'\nFound {len(nl_fires)} fires in Newfoundland and Labrador:')
    for i, fire in enumerate(nl_fires[:5], 1):  # Show first 5
        print(f'\nFire {i}:')
        for key, value in fire.items():
            print(f'  {key}: {value}')
else:
    print('\nNo NL fires found. Checking first fire structure:')
    if fires:
        first_fire = fires[0]
        for key, value in first_fire.items():
            print(f'  {key}: {value}')
            
# Check if any fires are near NL coordinates (roughly 46-60N, 52-67W)
nl_region_fires = [f for f in fires if (
    46 <= float(f.get('lat', 0)) <= 60 and
    -67 <= float(f.get('lon', 0)) <= -52
)]
print(f'\nFires in NL geographic region (46-60N, 52-67W): {len(nl_region_fires)}')
if nl_region_fires and not nl_fires:
    print('These might be NL fires with different agency codes:')
    for fire in nl_region_fires[:3]:
        print(f'  Agency: {fire.get("agency")}, Lat: {fire.get("lat")}, Lon: {fire.get("lon")}')
