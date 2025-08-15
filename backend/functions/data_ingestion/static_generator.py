"""
Static JSON generator for cost-effective data distribution
Generates static JSON files to be served via CDN instead of database queries
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
from pathlib import Path
from loguru import logger

from models.fire_models import Wildfire, WeatherForecast, AQHIPrediction


class StaticDataGenerator:
    """Generates static JSON files for CDN distribution"""
    
    def __init__(self, output_dir: str = "./static-data"):
        """Initialize the static generator"""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_all_data_files(
        self,
        wildfires: List[Wildfire],
        weather_forecasts: List[WeatherForecast],
        predictions: List[AQHIPrediction]
    ) -> Dict[str, str]:
        """
        Generate all static JSON files
        
        Returns:
            Dictionary of generated file paths
        """
        files_generated = {}
        
        try:
            # Generate main data file (everything the app needs)
            main_data = self._generate_main_data_file(
                wildfires, weather_forecasts, predictions
            )
            files_generated['main'] = main_data
            
            # Generate community-specific files (smaller, targeted)
            community_files = self._generate_community_files(predictions)
            files_generated['communities'] = community_files
            
            # Generate metadata file
            metadata_file = self._generate_metadata_file(files_generated)
            files_generated['metadata'] = metadata_file
            
            logger.info(f"Generated {len(files_generated)} static data files")
            
        except Exception as e:
            logger.error(f"Error generating static files: {e}")
            raise
            
        return files_generated
    
    def _generate_main_data_file(
        self,
        wildfires: List[Wildfire],
        weather_forecasts: List[WeatherForecast],
        predictions: List[AQHIPrediction]
    ) -> str:
        """Generate the main data.json file"""
        
        # Create main data structure
        data = {
            'timestamp': datetime.now().isoformat(),
            'wildfires': [fire.to_dict() for fire in wildfires],
            'weather': [forecast.to_dict() for forecast in weather_forecasts],
            'predictions': [pred.to_dict() for pred in predictions],
            'bounds': {
                'min_lat': 46.5,
                'max_lat': 60.5,
                'min_lon': -67.5,
                'max_lon': -52.5
            }
        }
        
        # Write to file
        output_file = self.output_dir / 'data.json'
        with open(output_file, 'w') as f:
            json.dump(data, f, separators=(',', ':'))  # Compact JSON
            
        # Also create a pretty version for debugging
        debug_file = self.output_dir / 'data-pretty.json'
        with open(debug_file, 'w') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Generated main data file: {output_file}")
        return str(output_file)
    
    def _generate_community_files(
        self,
        predictions: List[AQHIPrediction]
    ) -> List[str]:
        """Generate individual community prediction files"""
        
        # Group predictions by community
        communities = {
            'st-johns': {'lat': 47.5615, 'lon': -52.7126},
            'mount-pearl': {'lat': 47.5189, 'lon': -52.8061},
            'conception-bay-south': {'lat': 47.5297, 'lon': -52.9547},
            'paradise': {'lat': 47.5361, 'lon': -52.8579},
            'holyrood': {'lat': 47.3875, 'lon': -53.1356},
            'bay-roberts': {'lat': 47.5989, 'lon': -53.2644},
            'carbonear': {'lat': 47.7369, 'lon': -53.2144},
            'harbour-grace': {'lat': 47.7050, 'lon': -53.2144}
        }
        
        files = []
        
        for community_name, coords in communities.items():
            # Find predictions near this community
            community_predictions = [
                pred for pred in predictions
                if abs(pred.latitude - coords['lat']) < 0.1
                and abs(pred.longitude - coords['lon']) < 0.1
            ]
            
            # Create community data
            community_data = {
                'community': community_name,
                'coordinates': coords,
                'timestamp': datetime.now().isoformat(),
                'current_aqhi': community_predictions[0].aqhi_value if community_predictions else 1,
                'predictions': [pred.to_dict() for pred in community_predictions[:12]]  # 12-hour forecast
            }
            
            # Write file
            output_file = self.output_dir / f'community-{community_name}.json'
            with open(output_file, 'w') as f:
                json.dump(community_data, f)
                
            files.append(str(output_file))
            
        logger.info(f"Generated {len(files)} community files")
        return files
    
    def _generate_metadata_file(self, files_generated: Dict[str, Any]) -> str:
        """Generate metadata about the data update"""
        
        metadata = {
            'last_updated': datetime.now().isoformat(),
            'next_update': (datetime.now().replace(minute=0, second=0) + 
                          timedelta(minutes=30)).isoformat(),
            'files': files_generated,
            'version': '1.0.0',
            'data_sources': [
                'Canadian Wildland Fire Information System (CWFIS)',
                'Environment Canada MSC GeoMet API'
            ]
        }
        
        output_file = self.output_dir / 'metadata.json'
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        return str(output_file)
    
    def generate_geojson_overlay(
        self,
        predictions: List[AQHIPrediction]
    ) -> str:
        """Generate GeoJSON for smoke plume overlay"""
        
        # Create GeoJSON structure
        features = []
        
        # Group predictions into a grid for visualization
        # This is simplified - real implementation would use the Gaussian plume model
        for pred in predictions:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [pred.longitude, pred.latitude]
                },
                'properties': {
                    'aqhi': pred.aqhi_value,
                    'pm25': pred.pm25_concentration,
                    'timestamp': pred.timestamp.isoformat()
                }
            }
            features.append(feature)
        
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        output_file = self.output_dir / 'smoke-overlay.geojson'
        with open(output_file, 'w') as f:
            json.dump(geojson, f)
            
        logger.info(f"Generated GeoJSON overlay: {output_file}")
        return str(output_file)


class GitHubPagesPublisher:
    """Publishes static files to GitHub Pages"""
    
    def __init__(self, repo_path: str, branch: str = 'gh-pages'):
        """Initialize the publisher"""
        self.repo_path = repo_path
        self.branch = branch
        
    def publish_files(self, static_dir: str) -> bool:
        """
        Publish static files to GitHub Pages
        
        This would:
        1. Switch to gh-pages branch
        2. Copy static files
        3. Commit and push
        """
        # Implementation would use git commands to publish
        # For now, this is a placeholder
        logger.info(f"Would publish {static_dir} to GitHub Pages")
        return True


# Modified main function to use static generation
def generate_static_data(request=None):
    """
    Cloud Function entry point for static data generation
    Runs every 30 minutes to update static JSON files
    """
    from functions.data_ingestion.wildfire_fetcher import WildfireFetcher
    from functions.data_ingestion.weather_fetcher import WeatherFetcher
    
    try:
        # Fetch data
        wildfire_fetcher = WildfireFetcher()
        weather_fetcher = WeatherFetcher()
        
        wildfires = wildfire_fetcher.fetch_active_fires()
        
        # Get weather for fire locations
        fire_locations = [(f.latitude, f.longitude) for f in wildfires]
        weather_forecasts = weather_fetcher.fetch_bulk_weather(fire_locations[:10])  # Limit for demo
        
        # Generate mock predictions (would be from smoke model)
        predictions = []  # This would come from the smoke modeling function
        
        # Generate static files
        generator = StaticDataGenerator()
        files = generator.generate_all_data_files(
            wildfires,
            weather_forecasts,
            predictions
        )
        
        # Publish to GitHub Pages or CDN
        publisher = GitHubPagesPublisher('.')
        publisher.publish_files('./static-data')
        
        return {
            'status': 'success',
            'files_generated': len(files),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating static data: {e}")
        return {
            'status': 'error',
            'error': str(e)
        }
