#!/usr/bin/env python
"""
Local script to generate and publish static data to GitHub Pages
Run this manually or via cron/scheduler to update the data
"""
import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta, timedelta
from typing import Dict, Any

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from functions.data_ingestion.wildfire_fetcher import WildfireFetcher
from functions.data_ingestion.weather_fetcher import WeatherFetcher
from functions.data_ingestion.aqhi_fetcher import AQHIFetcher
from functions.data_ingestion.static_generator import StaticDataGenerator
from models.fire_models import AQHIPrediction
from loguru import logger


class DataUpdater:
    """Updates static data files and publishes to GitHub Pages"""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.git_path = r"E:\Program Files\Git\bin\git.exe"
        
        logger.add("data_update.log", rotation="10 MB")
        
    def generate_predictions_with_real_aqhi(self, wildfires, weather_forecasts) -> list:
        """
        Generate AQHI predictions using real Environment Canada data
        Combined with fire proximity impacts
        """
        predictions = []
        
        # Fetch real AQHI data from Environment Canada
        aqhi_fetcher = AQHIFetcher()
        real_aqhi_data = aqhi_fetcher.fetch_all_aqhi()
        
        # Get St. John's AQHI as baseline
        stjohns_aqhi = 2  # Default
        for data in real_aqhi_data:
            if data['city'] == "St. John's":
                stjohns_aqhi = data['aqhi_value']
                logger.info(f"Real St. John's AQHI: {stjohns_aqhi}")
                if data.get('special_note'):
                    logger.info(f"Special note: {data['special_note']}")
                break
        
        # Communities to generate predictions for
        communities = {
            'St. Johns': (47.5615, -52.7126),
            'Mount Pearl': (47.5189, -52.8061),
            'Conception Bay South': (47.5297, -52.9547),
            'Paradise': (47.5361, -52.8579),
            'Holyrood': (47.3875, -53.1356),
            'Bay Roberts': (47.5989, -53.2644),
            'Carbonear': (47.7369, -53.2144),
            'Harbour Grace': (47.7050, -53.2144)
        }
        
        current_time = datetime.now()
        
        # Generate predictions for each community for next 12 hours
        for community_name, (lat, lon) in communities.items():
            for hour in range(12):
                forecast_time = current_time + timedelta(hours=hour)
                
                # Start with base AQHI from Environment Canada data
                if community_name == 'St. Johns':
                    # Use real AQHI for St. John's
                    aqhi_value = stjohns_aqhi
                else:
                    # For other communities, start with St. John's value
                    # and adjust based on fire proximity
                    aqhi_value = stjohns_aqhi
                
                # Calculate PM2.5 based on AQHI (inverse of our previous calculation)
                # This ensures PM2.5 values match the AQHI
                if aqhi_value <= 3:
                    pm25 = 5 + (aqhi_value - 1) * 3.5  # 5-12 µg/m³
                elif aqhi_value <= 6:
                    pm25 = 12 + (aqhi_value - 3) * 7.7  # 12-35 µg/m³
                elif aqhi_value <= 8:
                    pm25 = 35 + (aqhi_value - 6) * 10  # 35-55 µg/m³
                elif aqhi_value <= 10:
                    pm25 = 55 + (aqhi_value - 8) * 47.5  # 55-150 µg/m³
                else:
                    pm25 = 150 + (aqhi_value - 10) * 50  # 150+ µg/m³
                
                source_fires = []
                fire_impact_added = 0
                
                # Check for nearby fires and adjust if needed
                for fire in wildfires:
                    # Calculate distance in degrees (roughly 111km per degree)
                    distance_km = ((fire.latitude - lat)**2 + 
                                  (fire.longitude - lon)**2)**0.5 * 111
                    
                    # Only adjust for very close, out of control fires
                    if distance_km < 100 and fire.status.value == "OC":
                        source_fires.append(fire.fire_id)
                        
                        # Add small impact based on distance and size
                        if distance_km < 30 and fire.size_hectares > 100:
                            fire_impact_added = max(fire_impact_added, 2)  # Very close, large fire
                        elif distance_km < 50:
                            fire_impact_added = max(fire_impact_added, 1)  # Close fire
                
                # Add fire impact to AQHI (but keep it reasonable)
                aqhi_value = min(10, aqhi_value + fire_impact_added)
                
                # Adjust PM2.5 if fire impact was added
                if fire_impact_added > 0:
                    pm25 += fire_impact_added * 15
                
                prediction = AQHIPrediction(
                    timestamp=forecast_time,
                    latitude=lat,
                    longitude=lon,
                    aqhi_value=aqhi_value,
                    pm25_concentration=pm25,
                    source_fire_ids=source_fires,
                    confidence=0.75 if source_fires else 0.9
                )
                predictions.append(prediction)
        
        return predictions
    
    def update_data(self) -> Dict[str, Any]:
        """Main update process"""
        logger.info("Starting data update process")
        
        try:
            # Step 1: Fetch wildfire data
            logger.info("Fetching wildfire data...")
            wildfire_fetcher = WildfireFetcher()
            wildfires = wildfire_fetcher.fetch_active_fires()
            logger.info(f"Found {len(wildfires)} active fires")
            
            # Step 2: Fetch weather data
            logger.info("Fetching weather data...")
            weather_fetcher = WeatherFetcher()
            fire_locations = [(f.latitude, f.longitude) for f in wildfires[:5]]  # Limit for testing
            weather_forecasts = weather_fetcher.fetch_bulk_weather(fire_locations, hours_ahead=12)
            logger.info(f"Fetched weather for {len(weather_forecasts)} locations")
            
            # Step 3: Generate predictions with real AQHI data
            logger.info("Generating AQHI predictions with real Environment Canada data...")
            predictions = self.generate_predictions_with_real_aqhi(wildfires, weather_forecasts)
            logger.info(f"Generated {len(predictions)} predictions")
            
            # Step 4: Generate static files
            logger.info("Generating static JSON files...")
            # Files will be generated to a temp directory first
            temp_dir = self.root_dir / "temp_data"
            temp_dir.mkdir(exist_ok=True)
            generator = StaticDataGenerator(output_dir=str(temp_dir))
            files = generator.generate_all_data_files(
                wildfires,
                weather_forecasts,
                predictions
            )
            
            # Also generate GeoJSON overlay
            geojson_file = generator.generate_geojson_overlay(predictions[:100])  # Limit for file size
            files['geojson'] = geojson_file
            
            logger.info(f"Generated {len(files)} static files")
            
            # Step 5: Commit and push to GitHub
            self.publish_to_github()
            
            return {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'wildfires_count': len(wildfires),
                'predictions_count': len(predictions),
                'files_generated': len(files)
            }
            
        except Exception as e:
            logger.error(f"Error during update: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def publish_to_github(self):
        """Commit and push changes to GitHub Pages"""
        try:
            logger.info("Publishing to GitHub Pages...")
            
            # Change to repository root
            os.chdir(self.root_dir)
            
            # Checkout gh-pages branch
            subprocess.run([self.git_path, "checkout", "gh-pages"], check=True)
            
            # Copy files from temp to root of gh-pages
            import shutil
            temp_dir = self.root_dir / "temp_data"
            for file in temp_dir.glob("*.json"):
                shutil.copy2(file, self.root_dir / file.name)
            for file in temp_dir.glob("*.geojson"):
                shutil.copy2(file, self.root_dir / file.name)
            
            # Clean up temp directory
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            # Add changes
            subprocess.run([self.git_path, "add", "*.json", "*.geojson"], check=True)
            
            # Commit with timestamp
            commit_message = f"Data update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            subprocess.run([self.git_path, "commit", "-m", commit_message], check=False)
            
            # Push to origin
            subprocess.run([self.git_path, "push", "origin", "gh-pages"], check=True)
            
            # Switch back to main
            subprocess.run([self.git_path, "checkout", "main"], check=True)
            
            logger.info("Successfully published to GitHub Pages")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Git error: {e}")
        except Exception as e:
            logger.error(f"Publishing error: {e}")


def main():
    """Main entry point"""
    updater = DataUpdater()
    result = updater.update_data()
    
    # Print result
    print(json.dumps(result, indent=2))
    
    if result['status'] == 'success':
        print(f"\nData updated successfully!")
        print(f"Wildfires: {result['wildfires_count']}")
        print(f"Predictions: {result['predictions_count']}")
        print(f"Files generated: {result['files_generated']}")
        print(f"\nView live data at:")
        print(f"   https://robertg761.github.io/boreal-smoke-nl/")
        print(f"   https://robertg761.github.io/boreal-smoke-nl/data.json")
    else:
        print(f"\nUpdate failed: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    main()
