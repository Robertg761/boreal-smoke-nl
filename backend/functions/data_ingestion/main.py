"""
Main data ingestion orchestrator
Combines wildfire and weather data fetching and stores in Firestore
"""
import os
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

from backend.functions.data_ingestion.wildfire_fetcher import WildfireFetcher
from backend.functions.data_ingestion.weather_fetcher import WeatherFetcher
from backend.models.fire_models import Wildfire, WeatherForecast, FireStatus


class DataIngestionOrchestrator:
    """Orchestrates the data ingestion process"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        # Load environment variables
        load_dotenv()
        
        # Initialize Firebase Admin (if not already initialized)
        self._initialize_firebase()
        
        # Initialize fetchers
        self.wildfire_fetcher = WildfireFetcher()
        self.weather_fetcher = WeatherFetcher()
        
        # Get Firestore client
        self.db = firestore.client()
        
        logger.info("Data Ingestion Orchestrator initialized")
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            firebase_admin.get_app()
        except ValueError:
            # Not initialized, initialize now
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for Cloud Functions/Cloud Run)
                firebase_admin.initialize_app()
    
    def run_ingestion(self) -> Dict[str, Any]:
        """
        Run the complete data ingestion process
        
        Returns:
            Summary of ingestion results
        """
        start_time = datetime.now()
        results = {
            'status': 'success',
            'timestamp': start_time.isoformat(),
            'wildfires_processed': 0,
            'weather_locations_processed': 0,
            'errors': []
        }
        
        try:
            # Step 1: Fetch wildfire data
            logger.info("Fetching wildfire data...")
            wildfires = self._fetch_and_store_wildfires()
            results['wildfires_processed'] = len(wildfires)
            
            # Step 2: Fetch weather data for fire locations
            logger.info("Fetching weather data for fire locations...")
            weather_count = self._fetch_and_store_weather(wildfires)
            results['weather_locations_processed'] = weather_count
            
            # Step 3: Update ingestion metadata
            self._update_ingestion_metadata(results)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            results['processing_time_seconds'] = processing_time
            
            logger.info(f"Data ingestion completed in {processing_time:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Error during data ingestion: {e}")
            results['status'] = 'error'
            results['errors'].append(str(e))
        
        return results
    
    def _fetch_and_store_wildfires(self) -> List[Wildfire]:
        """
        Fetch wildfire data and store in Firestore
        
        Returns:
            List of processed wildfires
        """
        try:
            # Fetch active fires
            wildfires = self.wildfire_fetcher.fetch_active_fires()
            
            # Store in Firestore
            batch = self.db.batch()
            collection_ref = self.db.collection('wildfires')
            
            for fire in wildfires:
                doc_ref = collection_ref.document(fire.fire_id)
                batch.set(doc_ref, fire.to_dict(), merge=True)
            
            # Commit the batch
            batch.commit()
            
            logger.info(f"Stored {len(wildfires)} wildfires in Firestore")
            return wildfires
            
        except Exception as e:
            logger.error(f"Error fetching/storing wildfires: {e}")
            raise
    
    def _fetch_and_store_weather(self, wildfires: List[Wildfire]) -> int:
        """
        Fetch weather data for wildfire locations
        
        Args:
            wildfires: List of wildfire objects
            
        Returns:
            Number of weather locations processed
        """
        try:
            # Filter for out-of-control fires (most important for smoke modeling)
            oc_fires = [
                fire for fire in wildfires
                if fire.status == FireStatus.OUT_OF_CONTROL
            ]
            
            if not oc_fires:
                logger.info("No out-of-control fires found, fetching weather for all fires")
                oc_fires = wildfires[:10]  # Limit to 10 fires if none are OC
            
            # Get unique locations (some fires might be very close)
            locations = self._get_unique_locations(oc_fires)
            
            # Fetch weather for each location
            weather_forecasts = self.weather_fetcher.fetch_bulk_weather(
                locations,
                hours_ahead=12
            )
            
            # Store weather data in Firestore
            batch = self.db.batch()
            collection_ref = self.db.collection('weather_forecasts')
            
            for forecast in weather_forecasts:
                # Create document ID based on location and time
                doc_id = f"{forecast.location_lat:.4f}_{forecast.location_lon:.4f}_{forecast.forecast_time.timestamp()}"
                doc_ref = collection_ref.document(doc_id)
                batch.set(doc_ref, forecast.to_dict())
            
            # Commit the batch
            batch.commit()
            
            logger.info(f"Stored weather data for {len(weather_forecasts)} locations")
            return len(weather_forecasts)
            
        except Exception as e:
            logger.error(f"Error fetching/storing weather data: {e}")
            raise
    
    def _get_unique_locations(
        self, 
        wildfires: List[Wildfire],
        threshold_km: float = 10
    ) -> List[tuple]:
        """
        Get unique locations from wildfires, removing duplicates within threshold
        
        Args:
            wildfires: List of wildfire objects
            threshold_km: Distance threshold for considering locations unique
            
        Returns:
            List of unique (lat, lon) tuples
        """
        unique_locations = []
        
        for fire in wildfires:
            location = (fire.latitude, fire.longitude)
            
            # Check if this location is unique enough
            is_unique = True
            for existing_lat, existing_lon in unique_locations:
                # Simple distance check (approximate)
                distance = ((location[0] - existing_lat)**2 + 
                          (location[1] - existing_lon)**2)**0.5
                
                # Convert to approximate km (1 degree ≈ 111 km)
                distance_km = distance * 111
                
                if distance_km < threshold_km:
                    is_unique = False
                    break
            
            if is_unique:
                unique_locations.append(location)
        
        return unique_locations
    
    def _update_ingestion_metadata(self, results: Dict[str, Any]):
        """Update metadata about the last ingestion run"""
        try:
            metadata_ref = self.db.collection('metadata').document('last_ingestion')
            metadata_ref.set({
                'timestamp': datetime.now(),
                'results': results
            })
        except Exception as e:
            logger.error(f"Error updating metadata: {e}")


# Cloud Function entry point
def ingest_data(request=None):
    """
    Cloud Function entry point for data ingestion
    
    Args:
        request: Flask request object (for HTTP triggers)
        
    Returns:
        JSON response with ingestion results
    """
    orchestrator = DataIngestionOrchestrator()
    results = orchestrator.run_ingestion()
    return results


# Local development entry point
if __name__ == "__main__":
    # Set up logging for local development
    logger.add("ingestion.log", rotation="10 MB")
    
    # Run ingestion
    orchestrator = DataIngestionOrchestrator()
    results = orchestrator.run_ingestion()
    
    print(f"Ingestion completed: {results}")
