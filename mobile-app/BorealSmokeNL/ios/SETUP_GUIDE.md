# iOS Setup Guide for NL Wildfire Tracker

## Prerequisites

1. **macOS** with Xcode installed (version 14.0 or later)
2. **CocoaPods** installed (`sudo gem install cocoapods`)
3. **Apple Developer Account** (for device testing and App Store deployment)
4. **Google Maps API Key** configured for iOS

## Setup Steps

### 1. Install Dependencies

```bash
cd ios
pod install
```

### 2. Configure Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for iOS" for your project
3. Create or use existing API key
4. Add iOS restrictions:
   - Bundle ID: `com.borealsmokenl` (or your chosen bundle ID)
   - Add your development machine's IP if testing on simulator

5. Replace `YOUR_IOS_GOOGLE_MAPS_API_KEY` in `ios/BorealSmokeNL/AppDelegate.swift` with your actual API key:

```swift
GMSServices.provideAPIKey("YOUR_ACTUAL_API_KEY_HERE")
```

### 3. Update Bundle Identifier (if needed)

The default bundle identifier is set in Xcode project settings. To change it:

1. Open `ios/BorealSmokeNL.xcworkspace` in Xcode (not .xcodeproj)
2. Select the project in navigator
3. Go to "Signing & Capabilities" tab
4. Update Bundle Identifier to match your organization (e.g., `com.yourorg.nlwildfiretracker`)

### 4. Configure Signing

1. In Xcode, select your project
2. Go to "Signing & Capabilities" tab
3. Enable "Automatically manage signing"
4. Select your Team (Apple Developer account)

### 5. Build and Run

#### Option A: Using React Native CLI
```bash
# From project root (mobile-app/BorealSmokeNL)
npx react-native run-ios

# Or specify a device/simulator
npx react-native run-ios --simulator="iPhone 15"
```

#### Option B: Using Xcode
1. Open `ios/BorealSmokeNL.xcworkspace` in Xcode
2. Select your target device/simulator
3. Press Cmd+R to build and run

## Troubleshooting

### Pod Installation Issues
If you encounter issues with pod install:
```bash
cd ios
pod deintegrate
pod install --repo-update
```

### Build Errors
1. Clean build folder in Xcode: Cmd+Shift+K
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Clean and reinstall:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Google Maps Not Showing
- Verify API key is correct and has "Maps SDK for iOS" enabled
- Check bundle ID restrictions match your app's bundle ID
- Ensure you're using `GoogleMaps` provider in react-native-maps

## App Store Preparation

Before submitting to App Store:

1. **Update version numbers** in Xcode project settings
2. **Add app icons** in Assets.xcassets
3. **Configure launch screen** if needed
4. **Test on real device** in release mode
5. **Create App Store Connect** listing
6. **Archive and upload** through Xcode

## Required App Icons Sizes (iOS)

- 20pt (40x40, 60x60)
- 29pt (58x58, 87x87)
- 40pt (80x80, 120x120)
- 60pt (120x120, 180x180)
- 1024pt (1024x1024) for App Store

## Current Configuration Status

✅ App Display Name: "NL Wildfire Tracker"
✅ Location Permission Description: Added
✅ Google Maps SDK: Configured in AppDelegate.swift (needs API key)
✅ Podfile: Configured for Google Maps support
⚠️ Bundle Identifier: Using default (needs to be set in Xcode)
⚠️ API Key: Placeholder (needs actual key)
