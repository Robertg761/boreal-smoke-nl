# 🔥 Boreal Smoke NL

## Project Boreal Smoke

A hyperlocal, predictive air quality forecasting mobile application for residents of Newfoundland and Labrador, with an initial focus on the Avalon Peninsula. The app aggregates real-time wildfire and weather data to model smoke plume dispersion and provides residents with a simple, visual, and actionable 12-hour forecast of the Air Quality Health Index (AQHI) for their specific community.

## 🎯 Core Features

### MVP Features

- **Real-time Wildfire Tracking**: Display active wildfires on an interactive map with status indicators
- **Smoke Plume Modeling**: Gaussian plume model-based predictions of smoke dispersion patterns
- **12-Hour AQHI Forecast**: Community-specific air quality predictions updated every 15-30 minutes
- **Interactive Map Interface**: Full-screen map with wildfire pins and smoke plume overlays
- **Community Selector**: Quick access to AQHI forecasts for specific communities
- **Timeline Control**: Slider to view predictions across the 12-hour forecast period
- **Wind Visualization**: Display current and forecasted wind direction and speed
- **Color-Coded Risk Levels**: Intuitive visual representation of air quality health risks

## 🛠️ Technology Stack

### Mobile Application
- **Framework**: React Native (cross-platform iOS/Android)
- **Maps**: react-native-maps for native performance
- **State Management**: Redux Toolkit / Context API
- **UI Components**: React Native Elements
- **Navigation**: React Navigation

### Backend Services
- **Runtime**: Python 3.9+
- **Architecture**: Serverless Functions (AWS Lambda / Google Cloud Functions)
- **Database**: Firestore (Firebase NoSQL)
- **Data Processing**: NumPy, SciPy for modeling calculations
- **API Framework**: FastAPI / Flask (for local development)

### Data Sources
- **Wildfire Data**: Canadian Wildland Fire Information System (CWFIS) Datamart
- **Weather Data**: Environment Canada MSC GeoMet API
- **Mapping Data**: OpenStreetMap / Mapbox

### Infrastructure
- **Cloud Provider**: Google Cloud Platform / AWS
- **CI/CD**: GitHub Actions
- **Monitoring**: Cloud Monitoring / CloudWatch
- **Storage**: Cloud Storage for static assets

## 📦 Project Structure

```
boreal-smoke-nl/
├── mobile-app/           # React Native application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # Application screens
│   │   ├── services/     # API and data services
│   │   ├── models/       # Data models and types
│   │   ├── utils/        # Utility functions
│   │   └── assets/       # Images, fonts, etc.
│   ├── ios/             # iOS-specific code
│   ├── android/         # Android-specific code
│   └── package.json
│
├── backend/             # Python serverless functions
│   ├── functions/       # Individual function modules
│   │   ├── data_ingestion/
│   │   ├── smoke_modeling/
│   │   └── api_endpoints/
│   ├── models/          # Data models and schemas
│   ├── utils/           # Shared utilities
│   ├── tests/           # Unit and integration tests
│   └── requirements.txt
│
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.9+
- React Native development environment ([React Native CLI Setup](https://reactnative.dev/docs/environment-setup))
- Google Cloud SDK or AWS CLI (for deployment)
- Firebase CLI (for Firestore)

### Clone the Repository

```bash
git clone https://github.com/yourusername/boreal-smoke-nl.git
cd boreal-smoke-nl
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

5. Run locally (for development):
```bash
python -m uvicorn main:app --reload
```

### Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Firebase configuration and API endpoints
```

5. Start the Metro bundler:
```bash
npm start
# or
yarn start
```

6. Run on iOS (macOS only):
```bash
npm run ios
# or
yarn ios
```

7. Run on Android:
```bash
npm run android
# or
yarn android
```

## 🔧 Development

### Backend Development

The backend consists of scheduled serverless functions:

1. **Data Ingestion Function** (runs every 15-30 minutes):
   - Fetches active fire data from CWFIS
   - Retrieves weather data from Environment Canada
   - Stores processed data in Firestore

2. **Smoke Modeling Function** (triggered after data ingestion):
   - Implements Gaussian plume dispersion model
   - Generates AQHI prediction grid
   - Stores predictions for 12-hour forecast period

### Mobile App Development

Key components:

1. **Map View**: Full-screen interactive map with overlays
2. **Data Service**: Fetches predictions from Firestore
3. **UI Controls**: Community selector and timeline slider
4. **Visualization**: Smoke plume rendering and wind indicators

## 📊 Data Sources

### Canadian Wildland Fire Information System (CWFIS)
- **URL**: https://cwfis.cfs.nrcan.gc.ca/datamart
- **Data**: Active fires with location, size, and status
- **Update Frequency**: Near real-time

### Environment Canada MSC GeoMet API
- **URL**: https://api.weather.gc.ca/
- **Data**: Current and forecasted weather conditions
- **Parameters**: Wind speed, wind direction, temperature, humidity

## 🧮 Smoke Plume Modeling

The app uses a simplified 2D Gaussian plume model:

```
C(x,y) = (Q / (2π * U * σy * σz)) * exp(-y² / (2σy²)) * F(z)
```

Where:
- C = Concentration at point (x,y)
- Q = Emission rate (based on fire size)
- U = Wind speed
- σy, σz = Dispersion coefficients
- F(z) = Vertical distribution function

## 🗺️ Supported Communities (Initial Release)

### Avalon Peninsula
- St. John's
- Mount Pearl
- Conception Bay South
- Paradise
- Portugal Cove-St. Philip's
- Torbay
- Holyrood
- Bay Roberts
- Carbonear
- Harbour Grace

## 📈 Future Enhancements

- [ ] Province-wide coverage
- [ ] Historical data analysis
- [ ] Push notifications for air quality alerts
- [ ] Health recommendations based on AQHI levels
- [ ] Integration with personal health monitoring devices
- [ ] Offline mode with cached predictions
- [ ] Machine learning-enhanced predictions
- [ ] Social features for community reporting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Canadian Wildland Fire Information System (Natural Resources Canada)
- Environment and Climate Change Canada
- React Native community
- Firebase team

## 📞 Contact

Project Link: [https://github.com/yourusername/boreal-smoke-nl](https://github.com/yourusername/boreal-smoke-nl)

## ⚠️ Disclaimer

This app provides predictive modeling for informational purposes only. For official air quality information and health advisories, please consult Environment Canada and provincial health authorities.

---

**Built with ❤️ for the people of Newfoundland and Labrador**
