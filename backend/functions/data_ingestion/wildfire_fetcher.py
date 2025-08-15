"""
Wildfire data fetcher from CWFIS Datamart
"""
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

from backend.models.fire_models import Wildfire, FireStatus


class WildfireFetcher:
    """Fetches wildfire data from CWFIS Datamart"""
    
    # CWFIS Datamart endpoints
    CWFIS_BASE_URL = "https://cwfis.cfs.nrcan.gc.ca/datamart"
    ACTIVE_FIRES_URL = f"{CWFIS_BASE_URL}/activefire/activefires.json"
    
    # Newfoundland and Labrador bounding box (approximate)
    NL_BOUNDS = {
        'min_lat': 46.5,
        'max_lat': 60.5,
        'min_lon': -67.5,
        'max_lon': -52.5
    }
    
    def __init__(self):
        """Initialize the wildfire fetcher"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BorealSmokeNL/1.0 (Wildfire Air Quality Tracker)'
        })
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def fetch_active_fires(self) -> List[Wildfire]:
        """
        Fetch active fires from CWFIS Datamart
        
        Returns:
            List of Wildfire objects for NL region
        """
        try:
            logger.info("Fetching active fires from CWFIS Datamart")
            
            # Try JSON endpoint first
            response = self._fetch_json_fires()
            if response:
                return self._parse_json_fires(response)
            
            # Fallback to XML/KML if JSON fails
            logger.warning("JSON fetch failed, trying XML/KML format")
            response = self._fetch_kml_fires()
            if response:
                return self._parse_kml_fires(response)
            
            logger.error("Failed to fetch fires from any source")
            return []
            
        except Exception as e:
            logger.error(f"Error fetching active fires: {e}")
            raise
    
    def _fetch_json_fires(self) -> Optional[Dict[str, Any]]:
        """Fetch fires in JSON format"""
        try:
            response = self.session.get(
                self.ACTIVE_FIRES_URL,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching JSON fires: {e}")
            return None
    
    def _fetch_kml_fires(self) -> Optional[str]:
        """Fetch fires in KML format"""
        try:
            kml_url = f"{self.CWFIS_BASE_URL}/activefire/activefires.kml"
            response = self.session.get(kml_url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error fetching KML fires: {e}")
            return None
    
    def _parse_json_fires(self, data: Dict[str, Any]) -> List[Wildfire]:
        """Parse JSON fire data"""
        fires = []
        
        try:
            features = data.get('features', [])
            
            for feature in features:
                properties = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Extract coordinates
                coords = geometry.get('coordinates', [])
                if len(coords) < 2:
                    continue
                
                lon, lat = coords[0], coords[1]
                
                # Check if fire is in NL bounds
                if not self._is_in_nl_bounds(lat, lon):
                    continue
                
                # Parse fire properties
                fire = self._create_wildfire_from_properties(properties, lat, lon)
                if fire:
                    fires.append(fire)
                    
        except Exception as e:
            logger.error(f"Error parsing JSON fires: {e}")
        
        logger.info(f"Found {len(fires)} active fires in NL region")
        return fires
    
    def _parse_kml_fires(self, kml_data: str) -> List[Wildfire]:
        """Parse KML fire data"""
        fires = []
        
        try:
            # Parse KML with BeautifulSoup for better handling
            soup = BeautifulSoup(kml_data, 'xml')
            placemarks = soup.find_all('Placemark')
            
            for placemark in placemarks:
                # Extract coordinates
                point = placemark.find('Point')
                if not point:
                    continue
                    
                coords_text = point.find('coordinates').text.strip()
                coords = coords_text.split(',')
                if len(coords) < 2:
                    continue
                    
                lon, lat = float(coords[0]), float(coords[1])
                
                # Check if fire is in NL bounds
                if not self._is_in_nl_bounds(lat, lon):
                    continue
                
                # Extract extended data
                properties = {}
                extended_data = placemark.find('ExtendedData')
                if extended_data:
                    for data in extended_data.find_all('Data'):
                        name = data.get('name')
                        value = data.find('value').text if data.find('value') else None
                        if name and value:
                            properties[name] = value
                
                # Create wildfire object
                fire = self._create_wildfire_from_properties(properties, lat, lon)
                if fire:
                    fires.append(fire)
                    
        except Exception as e:
            logger.error(f"Error parsing KML fires: {e}")
        
        return fires
    
    def _create_wildfire_from_properties(
        self, 
        properties: Dict[str, Any], 
        lat: float, 
        lon: float
    ) -> Optional[Wildfire]:
        """Create a Wildfire object from properties dictionary"""
        try:
            # Extract common fields (field names may vary)
            fire_id = (
                properties.get('fire_id') or 
                properties.get('FIRE_ID') or 
                properties.get('irwinID') or
                f"NL_{datetime.now().timestamp()}"
            )
            
            size = float(
                properties.get('hectares', 0) or 
                properties.get('HECTARES', 0) or
                properties.get('area', 0) or
                0
            )
            
            status_raw = (
                properties.get('status', 'UNK') or
                properties.get('STATUS', 'UNK') or
                'UNK'
            ).upper()
            
            status = self._parse_fire_status(status_raw)
            
            # Parse dates
            start_date = self._parse_date(
                properties.get('start_date') or
                properties.get('START_DATE') or
                properties.get('discovered_date')
            ) or datetime.now()
            
            last_updated = self._parse_date(
                properties.get('last_updated') or
                properties.get('LAST_UPDATED') or
                properties.get('modified_date')
            ) or datetime.now()
            
            # Create wildfire object
            return Wildfire(
                fire_id=str(fire_id),
                latitude=lat,
                longitude=lon,
                size_hectares=size,
                status=status,
                start_date=start_date,
                last_updated=last_updated,
                agency=properties.get('agency', 'NL'),
                fire_name=properties.get('fire_name'),
                cause=properties.get('cause')
            )
            
        except Exception as e:
            logger.error(f"Error creating wildfire object: {e}")
            return None
    
    def _is_in_nl_bounds(self, lat: float, lon: float) -> bool:
        """Check if coordinates are within NL bounds"""
        return (
            self.NL_BOUNDS['min_lat'] <= lat <= self.NL_BOUNDS['max_lat'] and
            self.NL_BOUNDS['min_lon'] <= lon <= self.NL_BOUNDS['max_lon']
        )
    
    def _parse_fire_status(self, status_str: str) -> FireStatus:
        """Parse fire status string to enum"""
        status_map = {
            'OC': FireStatus.OUT_OF_CONTROL,
            'OUT OF CONTROL': FireStatus.OUT_OF_CONTROL,
            'BH': FireStatus.BEING_HELD,
            'BEING HELD': FireStatus.BEING_HELD,
            'UC': FireStatus.UNDER_CONTROL,
            'UNDER CONTROL': FireStatus.UNDER_CONTROL,
            'OUT': FireStatus.OUT,
            'EXTINGUISHED': FireStatus.OUT,
        }
        
        status_upper = status_str.upper()
        for key, value in status_map.items():
            if key in status_upper:
                return value
                
        return FireStatus.UNKNOWN
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse various date formats"""
        if not date_str:
            return None
            
        date_formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d',
            '%Y/%m/%d %H:%M:%S',
            '%Y/%m/%d'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
                
        return None
    
    def get_recent_fires(self, hours: int = 24) -> List[Wildfire]:
        """
        Get fires that have been updated in the last N hours
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of recently updated fires
        """
        all_fires = self.fetch_active_fires()
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        recent_fires = [
            fire for fire in all_fires
            if fire.last_updated >= cutoff_time
        ]
        
        logger.info(f"Found {len(recent_fires)} fires updated in last {hours} hours")
        return recent_fires
    
    def get_out_of_control_fires(self) -> List[Wildfire]:
        """Get only out-of-control fires"""
        all_fires = self.fetch_active_fires()
        
        oc_fires = [
            fire for fire in all_fires
            if fire.status == FireStatus.OUT_OF_CONTROL
        ]
        
        logger.info(f"Found {len(oc_fires)} out-of-control fires")
        return oc_fires
