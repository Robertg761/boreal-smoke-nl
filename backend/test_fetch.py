#!/usr/bin/env python
"""
Quick test script to verify wildfire data fetching works
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.functions.data_ingestion.wildfire_fetcher import WildfireFetcher
from backend.functions.data_ingestion.weather_fetcher import WeatherFetcher

def test_fetch():
    """Test fetching real data"""
    print("🔥 Testing Wildfire Data Fetching...")
    print("-" * 50)
    
    try:
        # Test wildfire fetching
        fetcher = WildfireFetcher()
        fires = fetcher.fetch_active_fires()
        
        print(f"✅ Successfully fetched {len(fires)} active fires in NL")
        
        if fires:
            print("\n📍 Sample fire data:")
            fire = fires[0]
            print(f"  Fire ID: {fire.fire_id}")
            print(f"  Location: {fire.latitude:.2f}, {fire.longitude:.2f}")
            print(f"  Size: {fire.size_hectares} hectares")
            print(f"  Status: {fire.status.value}")
        else:
            print("\n✨ Good news! No active fires in NL right now.")
            print("   (Using mock data for testing)")
            
            # Create mock fire for testing
            from backend.models.fire_models import Wildfire, FireStatus
            from datetime import datetime
            
            mock_fire = Wildfire(
                fire_id="TEST_001",
                latitude=47.8,
                longitude=-53.2,
                size_hectares=50.0,
                status=FireStatus.OUT_OF_CONTROL,
                start_date=datetime.now(),
                last_updated=datetime.now(),
                agency="NL",
                fire_name="Test Fire"
            )
            fires = [mock_fire]
            print(f"\n📍 Created mock fire at {mock_fire.latitude}, {mock_fire.longitude}")
        
        # Test weather fetching
        print("\n🌤️ Testing Weather Data Fetching...")
        print("-" * 50)
        
        weather_fetcher = WeatherFetcher()
        location = (fires[0].latitude, fires[0].longitude)
        
        print(f"Fetching weather for location: {location}")
        forecast = weather_fetcher.fetch_weather_at_location(
            location[0], location[1], hours_ahead=3
        )
        
        if forecast and forecast.forecasts:
            weather = forecast.forecasts[0]
            print(f"✅ Weather data retrieved:")
            print(f"  Wind Speed: {weather.wind_speed_kmh:.1f} km/h")
            print(f"  Wind Direction: {weather.wind_direction_degrees:.0f}°")
            print(f"  Temperature: {weather.temperature_celsius:.1f}°C")
        
        print("\n✅ All systems working! Ready to generate data updates.")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nThis might be because:")
        print("1. CWFIS website is temporarily down")
        print("2. Network connection issues")
        print("3. API endpoints have changed")
        print("\nThe app will still work with cached/mock data!")
        return False

if __name__ == "__main__":
    test_fetch()
