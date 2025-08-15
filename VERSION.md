# Version History - Boreal Smoke NL

## Version Numbering
We use Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards-compatible)
- **PATCH**: Bug fixes (backwards-compatible)

---

## [v0.1.0-alpha] - 2025-08-15

### 🎉 First Alpha Release
**Status**: Working Android app with basic functionality

### ✅ Features
- Google Maps integration with interactive map
- Community markers for 8 Newfoundland communities:
  - St. John's
  - Mount Pearl
  - Conception Bay South
  - Paradise
  - Holyrood
  - Bay Roberts
  - Carbonear
  - Harbour Grace
- Map type toggle (standard/satellite view)
- Community selector dropdown
- Refresh button for data updates
- Fallback data when API is unavailable
- Basic UI layout with controls

### 🔧 Technical Changes
- Fixed React Native 0.74 build configuration
- Integrated Google Maps SDK for Android
- Fixed data handling in MapScreen component
- Updated DataService with proper fallback structure
- Fixed MainApplication.kt for old architecture
- Added react-native-linear-gradient dependency
- Configured gradle for proper SDK paths

### ⚠️ Known Issues
- CWFIS wildfire API endpoints returning 404
- Using mock AQHI predictions (not real data)
- No real-time wildfire data available
- GitHub Pages data pipeline not yet functional

### 📱 Compatibility
- **Android**: ✅ Working (tested on Samsung Galaxy S24 Ultra)
- **iOS**: ❌ Not tested
- **Min Android SDK**: 24 (Android 7.0)
- **Target Android SDK**: 34 (Android 14)

### 🔑 Configuration
- Package Name: `com.borealsmokenl`
- Google Maps API Key: Configured and restricted

---

## Future Releases

### [v0.2.0] - Planned
- [ ] Fix wildfire data API integration
- [ ] Implement real Gaussian plume model
- [ ] Set up GitHub Pages data pipeline
- [ ] Add weather overlay

### [v0.3.0] - Planned
- [ ] Push notifications for air quality alerts
- [ ] User location tracking
- [ ] Historical data viewing
- [ ] Improved UI/UX with animations

### [v1.0.0] - Production Release Goals
- [ ] Full real-time data integration
- [ ] iOS support and testing
- [ ] Complete AQHI prediction model
- [ ] Performance optimization
- [ ] Comprehensive testing suite
- [ ] App store deployment ready

---

## How to Roll Back

To roll back to any version, use:
```bash
git checkout v0.1.0-alpha  # For this alpha version
```

To see all available versions:
```bash
git tag -l
```

To see what changed between versions:
```bash
git diff v0.1.0-alpha v0.2.0
```
