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
from datetime import datetime, timedelta
from typing import Dict, Any

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.functions.data_ingestion.wildfire_fetcher import WildfireFetcher
from backend.functions.data_ingestion.weather_fetcher import WeatherFetcher
from backend.functions.data_ingestion.static_generator import StaticDataGenerator
from backend.models.fire_models import AQHIPrediction
from loguru import logger


class DataUpdater:
    """Updates static data files and publishes to GitHub Pages"""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.git_path = r"E:\Program Files\Git\bin\git.exe"
        
        logger.add("data_update.log", rotation="10 MB")
        
    def generate_mock_predictions(self, wildfires, weather_forecasts) -> list:
        """
        Generate mock AQHI predictions
        In production, this would use the Gaussian plume model
        """
        predictions = []
        
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
                
                # Simple mock calculation based on distance to fires
                aqhi_value = 1  # Base value (good air quality)
                pm25 = 5.0  # Base PM2.5
                source_fires = []
                
                for fire in wildfires:
                    # Calculate distance (simplified)
                    distance = ((fire.latitude - lat)**2 + 
                              (fire.longitude - lon)**2)**0.5
                    
                    # If fire is within ~200km and out of control
                    if distance < 2.0 and fire.status.value == "OC":
                        # Increase AQHI based on distance and size
                        impact = (200 - distance * 100) / 200 * (fire.size_hectares / 100)
                        aqhi_value += int(impact * 3)
                        pm25 += impact * 15
                        source_fires.append(fire.fire_id)
                
                # Cap AQHI at 10
                aqhi_value = min(10, max(1, aqhi_value))
                
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
            
            # Step 3: Generate predictions (mock for now)
            logger.info("Generating AQHI predictions...")
            predictions = self.generate_mock_predictions(wildfires, weather_forecasts)
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
        print(f"\n✅ Data updated successfully!")
        print(f"📊 Wildfires: {result['wildfires_count']}")
        print(f"🔮 Predictions: {result['predictions_count']}")
        print(f"📁 Files generated: {result['files_generated']}")
        print(f"\n🌐 View live data at:")
        print(f"   https://robertg761.github.io/boreal-smoke-nl/")
        print(f"   https://robertg761.github.io/boreal-smoke-nl/data.json")
    else:
        print(f"\n❌ Update failed: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    main()
