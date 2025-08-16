# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Boreal Smoke NL is a React Native mobile application for tracking wildfires and air quality in Newfoundland and Labrador, Canada. The app displays real-time wildfire locations, smoke dispersion patterns, and Air Quality Health Index (AQHI) data on an interactive map.

## Development Commands

### Initial Setup
```bash
# Install Node dependencies
npm install

# iOS-specific setup (Mac only)
cd ios && bundle install && bundle exec pod install && cd ..

# Android-specific setup (first time)
cd android && ./gradlew clean && cd ..
```

### Running the Application
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
# Or specify simulator
npx react-native run-ios --simulator="iPhone 15"

# Run tests
npm test

# Run linter
npm run lint
```

### Building for Release
```bash
# Android release build
cd android && ./gradlew assembleRelease

# iOS release (use Xcode Archive)
open ios/BorealSmokeNL.xcworkspace
```

## Project Architecture

### Core Application Structure
- **App.tsx**: Main entry point wrapping MapScreen with SafeAreaProvider and ErrorBoundary
- **src/screens/MapScreen.js**: Primary screen containing the map view and all UI overlays
- **src/services/DataService.js**: Centralized data fetching service with rate limiting and HTTPS enforcement
- **src/components/**: Reusable UI components for map overlays, indicators, and modals

### Data Flow Architecture
1. **DataService** fetches from static JSON endpoints hosted on GitHub Pages
2. Backend Python scripts (in `/backend`) generate these static files from multiple APIs
3. The app polls for updates every 5 minutes (with rate limiting)
4. All coordinate data is validated before rendering on the map

### Key Components
- **AnimatedSmokeOverlay**: Renders animated smoke dispersion patterns with wind-based movement
- **FireDetailsModal**: Displays detailed information about selected wildfires
- **AQHIIndicator**: Shows air quality index with color-coded health recommendations
- **CommunitySelector**: Dropdown for selecting NL communities to center the map

### Backend Data Pipeline
The `/backend` directory contains Python scripts that aggregate data:
- **wildfire_fetcher.py**: Retrieves active fire data from NASA FIRMS API
- **aqhi_fetcher.py**: Fetches air quality data from Environment Canada
- **weather_fetcher.py**: Gets weather conditions for smoke animation
- **static_generator.py**: Generates consolidated JSON files for the app

## API Key Configuration

### Google Maps API Keys
API keys are stored in local configuration files (not in version control):

**Android**: Create `android/local.properties`:
```
MAPS_API_KEY=your_android_api_key_here
```

**iOS**: Create `ios/Config.xcconfig`:
```
GOOGLE_MAPS_API_KEY=your_ios_api_key_here
```

### API Key Restrictions (Google Cloud Console)
- **Android Package Name**: `com.borealsmokenl`
- **Android SHA-1 (Debug)**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **iOS Bundle ID**: `com.borealsmokenl`
- **Required APIs**: Maps SDK for Android, Maps SDK for iOS

## Security Considerations

### Implemented Security Measures
- API keys stored in gitignored local files (`android/local.properties`, `ios/Config.xcconfig`)
- Coordinate validation to prevent injection attacks
- Rate limiting (5-second minimum between API calls)
- HTTPS-only connections enforced
- Path sanitization in backend scripts
- Production-safe logging utility

### Sensitive File Patterns
The following files contain sensitive data and must never be committed:
- `android/local.properties`
- `ios/Config.xcconfig`
- `*.keystore`
- `.env` files

## Testing Strategy

### Running Single Tests
```bash
# Run specific test file
npm test -- src/components/__tests__/FireDetailsModal.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### iOS-Specific Testing
```bash
# Run on specific iOS version
npx react-native run-ios --simulator="iPhone 15" --version="17.0"

# Build for device testing
npx react-native run-ios --device "Your iPhone Name"
```

### Android-Specific Testing
```bash
# List available devices
adb devices

# Run on specific device
npx react-native run-android --deviceId="device_id"

# Debug APK location after build
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Common Development Tasks

### Updating Dependencies
```bash
# Update React Native
npx react-native upgrade

# Update pods after dependency changes (iOS)
cd ios && pod update && cd ..

# Clean and rebuild after major updates
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

### Debugging Network Requests
```bash
# Enable network debugging in Chrome DevTools
# Shake device or Cmd+D (iOS) / Cmd+M (Android) → Debug JS Remotely

# View DataService logs
# Check src/utils/debug.js for production-safe logging
```

### Map-Related Development
The app uses `react-native-maps` with Google Maps provider. Map styling and wildfire markers are configured in `src/screens/MapScreen.js`. Smoke overlay animations use `react-native-linear-gradient` for visual effects.

## Platform-Specific Notes

### iOS Development
- Requires macOS with Xcode 14.0+
- CocoaPods must be installed: `sudo gem install cocoapods`
- Always open `.xcworkspace` file in Xcode, not `.xcodeproj`
- Signing requires Apple Developer account configuration

### Android Development
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Build tools version: 34.0.0
- Gradle version configured in `android/gradle/wrapper/gradle-wrapper.properties`

## Data Endpoints
The app fetches data from GitHub Pages static hosting:
- Wildfire data: `https://robertg761.github.io/boreal-smoke-nl/wildfires.json`
- AQHI data: `https://robertg761.github.io/boreal-smoke-nl/aqhi.json`
- Weather data: `https://robertg761.github.io/boreal-smoke-nl/weather.json`

Backend scripts in `/backend` run periodically to update these endpoints.
