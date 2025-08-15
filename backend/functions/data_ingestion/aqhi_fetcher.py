#!/usr/bin/env python
"""
AQHI Fetcher for Environment Canada
Fetches real-time Air Quality Health Index data
"""
import requests
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional
from datetime import datetime
from loguru import logger

class AQHIFetcher:
    """Fetches AQHI data from Environment Canada"""
    
    # Environment Canada AQHI RSS feeds for NL communities
    AQHI_FEEDS = {
        "St. John's": "https://weather.gc.ca/rss/aqhi/nl-1_e.xml",
        # Note: Most NL communities don't have AQHI monitoring
        # We'll need to interpolate or use nearest station
    }
    
    # Fallback city pages for scraping if RSS fails
    CITY_PAGES = {
        "St. John's": "https://weather.gc.ca/city/pages/nl-24_metric_e.html",
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BorealSmokeNL/1.0 (AQHI Data Fetcher)'
        })
    
    def fetch_aqhi_from_rss(self, city: str) -> Optional[Dict]:
        """
        Fetch AQHI from Environment Canada RSS feed
        """
        if city not in self.AQHI_FEEDS:
            logger.warning(f"No AQHI RSS feed available for {city}")
            return None
            
        try:
            url = self.AQHI_FEEDS[city]
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            # Find AQHI value in the feed
            # The structure is typically:
            # <item>
            #   <title>Air Quality Health Index - St. John's</title>
            #   <description>Current AQHI: 2 (Low Risk)</description>
            # </item>
            
            for item in root.findall('.//item'):
                title = item.find('title')
                if title is not None and 'Air Quality' in title.text:
                    description = item.find('description')
                    if description is not None:
                        # Parse AQHI value from description
                        text = description.text
                        if 'Current AQHI:' in text:
                            # Extract the number
                            parts = text.split('Current AQHI:')[1].strip()
                            aqhi_value = int(parts.split()[0])
                            
                            # Check for special conditions
                            special_note = None
                            if '*' in text:
                                special_note = text.split('*')[1].strip()
                            
                            return {
                                'city': city,
                                'aqhi_value': aqhi_value,
                                'timestamp': datetime.now().isoformat(),
                                'special_note': special_note,
                                'source': 'Environment Canada RSS'
                            }
                            
        except Exception as e:
            logger.error(f"Error fetching AQHI RSS for {city}: {e}")
            
        return None
    
    def fetch_aqhi_from_page(self, city: str) -> Optional[Dict]:
        """
        Scrape AQHI from Environment Canada city page as fallback
        """
        if city not in self.CITY_PAGES:
            logger.warning(f"No city page available for {city}")
            return None
            
        try:
            url = self.CITY_PAGES[city]
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Look for AQHI in the HTML
            # The AQHI is typically in a div with class "aqhi-value"
            # or in a table with specific markers
            
            text = response.text
            
            # Simple pattern matching for AQHI value
            if 'Air Quality Health Index' in text:
                # Look for patterns like "AQHI: 2" or "Current: 2"
                import re
                
                # Try different patterns
                patterns = [
                    r'AQHI[:\s]+(\d+)',
                    r'Current[:\s]+(\d+)',
                    r'Air Quality Health Index[:\s]+(\d+)',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        aqhi_value = int(match.group(1))
                        
                        # Check for smoke warnings
                        special_note = None
                        if 'smoke' in text.lower():
                            if '*10' in text:
                                special_note = "High risk in smoke conditions"
                        
                        return {
                            'city': city,
                            'aqhi_value': aqhi_value,
                            'timestamp': datetime.now().isoformat(),
                            'special_note': special_note,
                            'source': 'Environment Canada Web'
                        }
                        
        except Exception as e:
            logger.error(f"Error scraping AQHI for {city}: {e}")
            
        return None
    
    def fetch_all_aqhi(self) -> List[Dict]:
        """
        Fetch AQHI for all monitored cities in NL
        """
        results = []
        
        # Currently only St. John's has AQHI monitoring in NL
        for city in ["St. John's"]:
            # Try RSS first
            data = self.fetch_aqhi_from_rss(city)
            
            # Fallback to web scraping
            if not data:
                data = self.fetch_aqhi_from_page(city)
            
            if data:
                results.append(data)
                logger.info(f"Fetched AQHI for {city}: {data['aqhi_value']}")
            else:
                # Default to clean air if no data available
                logger.warning(f"No AQHI data for {city}, using default")
                results.append({
                    'city': city,
                    'aqhi_value': 2,  # Default to low risk
                    'timestamp': datetime.now().isoformat(),
                    'special_note': "No real-time data available",
                    'source': 'Default'
                })
        
        return results
    
    def interpolate_aqhi_for_location(self, lat: float, lon: float, 
                                     stjohns_aqhi: int, 
                                     fire_impacts: Dict = None) -> int:
        """
        Interpolate AQHI for locations without monitoring
        Based on St. John's value and fire proximity
        """
        # Start with St. John's base value
        base_aqhi = stjohns_aqhi
        
        # Adjust based on fire impacts if provided
        if fire_impacts:
            # Add impact from nearby fires
            if fire_impacts.get('distance_km', float('inf')) < 50:
                base_aqhi += 3  # Significant impact
            elif fire_impacts.get('distance_km', float('inf')) < 100:
                base_aqhi += 2  # Moderate impact
            elif fire_impacts.get('distance_km', float('inf')) < 200:
                base_aqhi += 1  # Minor impact
        
        # Cap at reasonable maximum
        return min(base_aqhi, 10)


if __name__ == "__main__":
    # Test the fetcher
    fetcher = AQHIFetcher()
    results = fetcher.fetch_all_aqhi()
    
    for result in results:
        print(f"{result['city']}: AQHI {result['aqhi_value']}")
        if result['special_note']:
            print(f"  Note: {result['special_note']}")
