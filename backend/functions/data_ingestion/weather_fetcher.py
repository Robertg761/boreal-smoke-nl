"""
Weather data fetcher from Environment Canada MSC GeoMet API
"""
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import json

from backend.models.fire_models import WeatherData, WeatherForecast


class WeatherFetcher:
    """Fetches weather data from Environment Canada"""
    
    # Environment Canada API endpoints
    EC_BASE_URL = "https://api.weather.gc.ca"
    GEOMET_BASE_URL = "https://geo.weather.gc.ca/geomet"
    
    # Weather stations in NL (key locations)
    NL_WEATHER_STATIONS = {
        "STJOHNS": {"lat": 47.6167, "lon": -52.7515, "station_id": "CYYT"},
        "GANDER": {"lat": 48.9369, "lon": -54.5681, "station_id": "CYQX"},
        "CORNERBROOK": {"lat": 48.9361, "lon": -57.8858, "station_id": "CYDF"},
        "HAPPYVALLEY": {"lat": 53.3192, "lon": -60.3583, "station_id": "CYHV"},
        "STEPHENVILLE": {"lat": 48.5444, "lon": -58.5500, "station_id": "CYJT"},
    }
    
    def __init__(self):
        """Initialize the weather fetcher"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BorealSmokeNL/1.0 (Weather Data Fetcher)'
        })
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def fetch_weather_at_location(
        self, 
        lat: float, 
        lon: float,
        hours_ahead: int = 12
    ) -> Optional[WeatherForecast]:
        """
        Fetch weather data for a specific location
        
        Args:
            lat: Latitude
            lon: Longitude
            hours_ahead: Number of hours to forecast
            
        Returns:
            WeatherForecast object or None if failed
        """
        try:
            logger.info(f"Fetching weather for location ({lat}, {lon})")
            
            # Find nearest weather station
            station_id, station_lat, station_lon = self._find_nearest_station(lat, lon)
            
            # Fetch current conditions
            current_weather = self._fetch_current_conditions(station_id)
            
            # Fetch forecast data
            forecast_data = self._fetch_forecast_data(lat, lon, hours_ahead)
            
            # Combine current and forecast
            weather_points = []
            
            # Add current weather
            if current_weather:
                weather_points.append(current_weather)
            
            # Add forecast points
            weather_points.extend(forecast_data)
            
            if weather_points:
                return WeatherForecast(
                    location_lat=lat,
                    location_lon=lon,
                    forecast_time=datetime.now(),
                    forecasts=weather_points
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return None
    
    def _find_nearest_station(self, lat: float, lon: float) -> Tuple[str, float, float]:
        """Find the nearest weather station to given coordinates"""
        min_distance = float('inf')
        nearest_station = None
        
        for station_name, station_info in self.NL_WEATHER_STATIONS.items():
            # Simple distance calculation (not exact but good enough)
            distance = ((lat - station_info['lat'])**2 + 
                       (lon - station_info['lon'])**2)**0.5
            
            if distance < min_distance:
                min_distance = distance
                nearest_station = (
                    station_info['station_id'],
                    station_info['lat'],
                    station_info['lon']
                )
        
        logger.info(f"Nearest station: {nearest_station[0]}")
        return nearest_station
    
    def _fetch_current_conditions(self, station_id: str) -> Optional[WeatherData]:
        """Fetch current weather conditions from a station"""
        try:
            # Use the collections endpoint for current conditions
            url = f"{self.EC_BASE_URL}/collections/climate-hourly/items"
            params = {
                "STATION_NAME": station_id,
                "limit": 1,
                "sortby": "-LOCAL_DATE"
            }
            
            response = self.session.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                features = data.get('features', [])
                
                if features:
                    return self._parse_current_weather(features[0])
            
            # Fallback to alternative endpoint
            return self._fetch_current_metar(station_id)
            
        except Exception as e:
            logger.error(f"Error fetching current conditions: {e}")
            return None
    
    def _fetch_current_metar(self, station_id: str) -> Optional[WeatherData]:
        """Fetch current METAR data as fallback"""
        try:
            # GeoMet WMS endpoint for current weather
            url = f"{self.GEOMET_BASE_URL}/data/weather/observations/aviation/alltime/{station_id}.json"
            
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_metar_data(data)
                
        except Exception as e:
            logger.error(f"Error fetching METAR data: {e}")
            
        return None
    
    def _fetch_forecast_data(
        self, 
        lat: float, 
        lon: float, 
        hours_ahead: int
    ) -> List[WeatherData]:
        """Fetch forecast weather data for location"""
        forecasts = []
        
        try:
            # Use GDPS (Global Deterministic Prediction System) data
            base_time = datetime.now()
            
            for hour in range(1, hours_ahead + 1):
                forecast_time = base_time + timedelta(hours=hour)
                
                # Fetch wind data for this hour
                wind_data = self._fetch_gdps_wind(lat, lon, hour)
                
                # Fetch temperature and other data
                temp_data = self._fetch_gdps_temperature(lat, lon, hour)
                
                if wind_data and temp_data:
                    weather = WeatherData(
                        timestamp=forecast_time,
                        latitude=lat,
                        longitude=lon,
                        wind_speed_kmh=wind_data['speed'],
                        wind_direction_degrees=wind_data['direction'],
                        temperature_celsius=temp_data['temperature'],
                        relative_humidity=temp_data.get('humidity', 50),
                        pressure_kpa=temp_data.get('pressure', 101.3),
                        precipitation_mm=temp_data.get('precipitation', 0)
                    )
                    forecasts.append(weather)
                    
        except Exception as e:
            logger.error(f"Error fetching forecast data: {e}")
        
        return forecasts
    
    def _fetch_gdps_wind(self, lat: float, lon: float, hour: int) -> Optional[Dict]:
        """Fetch GDPS wind data"""
        try:
            # This would normally query the GDPS data service
            # For now, return mock data with realistic patterns
            import random
            
            # Simulate wind patterns
            base_speed = 15 + random.uniform(-5, 10)
            base_direction = 270 + random.uniform(-45, 45)  # Predominantly westerly
            
            return {
                'speed': max(0, base_speed + hour * random.uniform(-1, 1)),
                'direction': (base_direction + hour * random.uniform(-5, 5)) % 360
            }
            
        except Exception as e:
            logger.error(f"Error fetching GDPS wind: {e}")
            return None
    
    def _fetch_gdps_temperature(self, lat: float, lon: float, hour: int) -> Optional[Dict]:
        """Fetch GDPS temperature and other data"""
        try:
            # This would normally query the GDPS data service
            # For now, return mock data with realistic patterns
            import random
            
            # Simulate temperature patterns (summer conditions)
            base_temp = 18 + random.uniform(-3, 5)
            
            # Temperature varies with time of day
            hour_of_day = (datetime.now().hour + hour) % 24
            if 6 <= hour_of_day <= 18:  # Daytime
                temp_adjust = 3
            else:  # Nighttime
                temp_adjust = -2
            
            return {
                'temperature': base_temp + temp_adjust + random.uniform(-1, 1),
                'humidity': 60 + random.uniform(-20, 20),
                'pressure': 101.3 + random.uniform(-1, 1),
                'precipitation': max(0, random.uniform(-0.5, 2))
            }
            
        except Exception as e:
            logger.error(f"Error fetching GDPS temperature: {e}")
            return None
    
    def _parse_current_weather(self, feature: Dict) -> Optional[WeatherData]:
        """Parse current weather from API response"""
        try:
            properties = feature.get('properties', {})
            geometry = feature.get('geometry', {})
            coords = geometry.get('coordinates', [0, 0])
            
            return WeatherData(
                timestamp=datetime.now(),
                latitude=coords[1],
                longitude=coords[0],
                wind_speed_kmh=float(properties.get('WIND_SPEED', 0)),
                wind_direction_degrees=float(properties.get('WIND_DIRECTION', 0)),
                temperature_celsius=float(properties.get('TEMPERATURE', 15)),
                relative_humidity=float(properties.get('RELATIVE_HUMIDITY', 50)),
                pressure_kpa=float(properties.get('PRESSURE', 101.3)),
                precipitation_mm=float(properties.get('PRECIPITATION', 0))
            )
            
        except Exception as e:
            logger.error(f"Error parsing weather data: {e}")
            return None
    
    def _parse_metar_data(self, data: Dict) -> Optional[WeatherData]:
        """Parse METAR data format"""
        try:
            # Extract relevant fields from METAR
            # This is simplified - real METAR parsing is more complex
            return WeatherData(
                timestamp=datetime.now(),
                latitude=data.get('latitude', 0),
                longitude=data.get('longitude', 0),
                wind_speed_kmh=data.get('wind_speed_kph', 0),
                wind_direction_degrees=data.get('wind_direction', 0),
                temperature_celsius=data.get('temperature', 15),
                relative_humidity=data.get('humidity', 50),
                pressure_kpa=data.get('pressure_kpa', 101.3),
                precipitation_mm=data.get('precipitation_mm', 0)
            )
            
        except Exception as e:
            logger.error(f"Error parsing METAR data: {e}")
            return None
    
    def fetch_bulk_weather(
        self,
        locations: List[Tuple[float, float]],
        hours_ahead: int = 12
    ) -> List[WeatherForecast]:
        """
        Fetch weather for multiple locations
        
        Args:
            locations: List of (lat, lon) tuples
            hours_ahead: Hours to forecast
            
        Returns:
            List of WeatherForecast objects
        """
        forecasts = []
        
        for lat, lon in locations:
            forecast = self.fetch_weather_at_location(lat, lon, hours_ahead)
            if forecast:
                forecasts.append(forecast)
        
        logger.info(f"Fetched weather for {len(forecasts)}/{len(locations)} locations")
        return forecasts
