"""
Validation utilities for backend data processing
"""
from typing import Tuple, Optional
from loguru import logger


def validate_coordinates(lat: float, lon: float, location_name: str = "") -> Tuple[bool, Optional[str]]:
    """
    Validate latitude and longitude coordinates
    
    Args:
        lat: Latitude value
        lon: Longitude value
        location_name: Optional name for logging
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Check if values are numeric
        lat = float(lat)
        lon = float(lon)
        
        # Check latitude range (-90 to 90)
        if not -90 <= lat <= 90:
            error = f"Invalid latitude {lat} for {location_name}: must be between -90 and 90"
            logger.warning(error)
            return False, error
            
        # Check longitude range (-180 to 180)
        if not -180 <= lon <= 180:
            error = f"Invalid longitude {lon} for {location_name}: must be between -180 and 180"
            logger.warning(error)
            return False, error
            
        # Check for Newfoundland and Labrador region (optional warning)
        # NL approximate bounds: lat 46.5 to 60.5, lon -67.5 to -52.5
        if not (46.5 <= lat <= 60.5 and -67.5 <= lon <= -52.5):
            logger.debug(f"Coordinates ({lat}, {lon}) for {location_name} are outside NL region")
            
        return True, None
        
    except (ValueError, TypeError) as e:
        error = f"Invalid coordinate values for {location_name}: {e}"
        logger.error(error)
        return False, error


def validate_nl_region(lat: float, lon: float) -> bool:
    """
    Check if coordinates are within Newfoundland and Labrador region
    
    Args:
        lat: Latitude value
        lon: Longitude value
        
    Returns:
        True if within NL bounds, False otherwise
    """
    # Newfoundland and Labrador approximate bounds
    NL_MIN_LAT = 46.5
    NL_MAX_LAT = 60.5
    NL_MIN_LON = -67.5
    NL_MAX_LON = -52.5
    
    return (NL_MIN_LAT <= lat <= NL_MAX_LAT and 
            NL_MIN_LON <= lon <= NL_MAX_LON)


def sanitize_fire_data(fire_data: dict) -> dict:
    """
    Sanitize and validate fire data
    
    Args:
        fire_data: Raw fire data dictionary
        
    Returns:
        Sanitized fire data dictionary
    """
    # Validate coordinates
    lat = fire_data.get('latitude', 0)
    lon = fire_data.get('longitude', 0)
    fire_id = fire_data.get('fire_id', 'unknown')
    
    is_valid, error = validate_coordinates(lat, lon, f"fire {fire_id}")
    
    if not is_valid:
        # Log error but don't crash - use default safe values
        logger.error(f"Invalid fire data: {error}")
        fire_data['latitude'] = 47.5  # Default to St. John's area
        fire_data['longitude'] = -52.7
        fire_data['data_quality'] = 'invalid_coordinates'
    
    # Ensure size is non-negative
    if 'size_hectares' in fire_data:
        fire_data['size_hectares'] = max(0, float(fire_data.get('size_hectares', 0)))
    
    # Validate status
    valid_statuses = ['OC', 'UC', 'BH', 'OUT']
    if fire_data.get('status') not in valid_statuses:
        fire_data['status'] = 'UC'  # Default to Under Control
        
    return fire_data
