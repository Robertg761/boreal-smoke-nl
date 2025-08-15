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
from functions.data_ingestion.static_generator import StaticDataGenerator
from models.fire_models import AQHIPrediction
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
                # Base values for clean air
                aqhi_value = 1  # Base value (good air quality)
                pm25 = 8.0  # Base PM2.5 in µg/m³ (normal background)
                source_fires = []
                
                for fire in wildfires:
                    # Calculate distance in degrees (roughly 111km per degree)
                    distance_km = ((fire.latitude - lat)**2 + 
                                  (fire.longitude - lon)**2)**0.5 * 111
                    
                    # If fire is within ~200km and out of control
                    if distance_km < 200 and fire.status.value == "OC":
                        # Calculate impact based on distance and fire size
                        # Closer fires have more impact
                        distance_factor = max(0, (200 - distance_km) / 200)  # 0 to 1
                        
                        # Larger fires have more impact
                        size_factor = min(1, fire.size_hectares / 1000)  # Cap at 1 for 1000+ hectares
                        
                        # Combined impact
                        impact = distance_factor * size_factor
                        
                        # Add to PM2.5 realistically
                        # Maximum addition of 50 µg/m³ per fire for very close, large fires
                        pm25 += impact * 50
                        
                        # AQHI increases more gradually
                        aqhi_value += impact * 4
                        
                        source_fires.append(fire.fire_id)
                
                # Calculate AQHI from PM2.5 using Canadian standards
                # PM2.5 to AQHI approximation:
                # 0-12 µg/m³ = AQHI 1-3
                # 12-35 µg/m³ = AQHI 4-6
                # 35-55 µg/m³ = AQHI 7-8
                # 55-150 µg/m³ = AQHI 9-10
                # 150+ µg/m³ = AQHI 10+
                if pm25 <= 12:
                    calculated_aqhi = 1 + (pm25 / 12) * 2
                elif pm25 <= 35:
                    calculated_aqhi = 4 + ((pm25 - 12) / 23) * 2
                elif pm25 <= 55:
                    calculated_aqhi = 7 + ((pm25 - 35) / 20)
                elif pm25 <= 150:
                    calculated_aqhi = 9 + ((pm25 - 55) / 95)
                else:
                    # Don't cap at 10 for extreme conditions
                    calculated_aqhi = 10 + ((pm25 - 150) / 50)
                
                # Use the calculated AQHI
                aqhi_value = round(max(1, calculated_aqhi))
                
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
