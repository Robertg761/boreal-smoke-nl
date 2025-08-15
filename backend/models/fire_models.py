"""
Data models for wildfire and weather data
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class FireStatus(Enum):
    """Wildfire status classifications"""
    OUT_OF_CONTROL = "OC"
    BEING_HELD = "BH"
    UNDER_CONTROL = "UC"
    OUT = "OUT"
    UNKNOWN = "UNK"


@dataclass
class Wildfire:
    """Model for wildfire data"""
    fire_id: str
    latitude: float
    longitude: float
    size_hectares: float
    status: FireStatus
    start_date: datetime
    last_updated: datetime
    agency: str
    fire_name: Optional[str] = None
    cause: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {
            'fire_id': self.fire_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'size_hectares': self.size_hectares,
            'status': self.status.value,
            'start_date': self.start_date.isoformat(),
            'last_updated': self.last_updated.isoformat(),
            'agency': self.agency,
            'fire_name': self.fire_name,
            'cause': self.cause
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Wildfire':
        """Create from dictionary"""
        return cls(
            fire_id=data['fire_id'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            size_hectares=data['size_hectares'],
            status=FireStatus(data['status']),
            start_date=datetime.fromisoformat(data['start_date']),
            last_updated=datetime.fromisoformat(data['last_updated']),
            agency=data['agency'],
            fire_name=data.get('fire_name'),
            cause=data.get('cause')
        )


@dataclass
class WeatherData:
    """Model for weather data at a specific location"""
    timestamp: datetime
    latitude: float
    longitude: float
    wind_speed_kmh: float
    wind_direction_degrees: float
    temperature_celsius: float
    relative_humidity: float
    pressure_kpa: float
    precipitation_mm: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'latitude': self.latitude,
            'longitude': self.longitude,
            'wind_speed_kmh': self.wind_speed_kmh,
            'wind_direction_degrees': self.wind_direction_degrees,
            'temperature_celsius': self.temperature_celsius,
            'relative_humidity': self.relative_humidity,
            'pressure_kpa': self.pressure_kpa,
            'precipitation_mm': self.precipitation_mm
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WeatherData':
        """Create from dictionary"""
        return cls(
            timestamp=datetime.fromisoformat(data['timestamp']),
            latitude=data['latitude'],
            longitude=data['longitude'],
            wind_speed_kmh=data['wind_speed_kmh'],
            wind_direction_degrees=data['wind_direction_degrees'],
            temperature_celsius=data['temperature_celsius'],
            relative_humidity=data['relative_humidity'],
            pressure_kpa=data['pressure_kpa'],
            precipitation_mm=data['precipitation_mm']
        )


@dataclass
class WeatherForecast:
    """Model for weather forecast data"""
    location_lat: float
    location_lon: float
    forecast_time: datetime
    forecasts: List[WeatherData]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {
            'location_lat': self.location_lat,
            'location_lon': self.location_lon,
            'forecast_time': self.forecast_time.isoformat(),
            'forecasts': [f.to_dict() for f in self.forecasts]
        }


@dataclass
class AQHIPrediction:
    """Model for AQHI predictions at a specific location"""
    timestamp: datetime
    latitude: float
    longitude: float
    aqhi_value: int  # 1-10+
    pm25_concentration: float  # μg/m³
    source_fire_ids: List[str]
    confidence: float  # 0-1
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'latitude': self.latitude,
            'longitude': self.longitude,
            'aqhi_value': self.aqhi_value,
            'pm25_concentration': self.pm25_concentration,
            'source_fire_ids': self.source_fire_ids,
            'confidence': self.confidence
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AQHIPrediction':
        """Create from dictionary"""
        return cls(
            timestamp=datetime.fromisoformat(data['timestamp']),
            latitude=data['latitude'],
            longitude=data['longitude'],
            aqhi_value=data['aqhi_value'],
            pm25_concentration=data['pm25_concentration'],
            source_fire_ids=data['source_fire_ids'],
            confidence=data['confidence']
        )


@dataclass
class Community:
    """Model for NL communities"""
    name: str
    latitude: float
    longitude: float
    population: Optional[int] = None
    region: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'population': self.population,
            'region': self.region
        }
