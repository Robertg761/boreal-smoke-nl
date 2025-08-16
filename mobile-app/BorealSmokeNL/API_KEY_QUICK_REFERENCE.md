# Google Maps API Key Quick Reference

## 🔑 For Google Cloud Console Configuration

Copy and paste these values when setting up your API key restrictions:

### Android Configuration
**Package Name:** `com.borealsmokenl`

**SHA-1 Fingerprints:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```
(This is your debug certificate - for development)

### iOS Configuration (when you set it up on Mac)
**Bundle ID:** `com.borealsmokenl` (or whatever you set in Xcode)

### APIs to Enable
Make sure these are enabled in your Google Cloud Project:
- ✅ Maps SDK for Android
- ✅ Maps SDK for iOS

### Exposed Key to Delete/Rotate
```
AIzaSyCu1xWwaWEHNm714LOauCZaDVg_q7X_Chw
```
⚠️ **DELETE THIS KEY IMMEDIATELY in Google Cloud Console**

### Testing Your New Key
After setting up the new key:
1. Add it to `android/local.properties` (don't commit this file!)
2. Clean and rebuild: `cd android && ./gradlew clean`
3. Run the app: `npx react-native run-android`

### Additional SHA-1 Fingerprints

If you need them later:
- **Test certificate:** `E2:AB:D8:0E:7D:FA:BD:C4:D3:5D:DE:3F:9A:54:22:3C:C9:F0:96:D2`
- **Release certificate:** Will be generated when you create a signed APK

### To Get Release SHA-1 (when needed)
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

---
**Remember:** Never commit API keys to version control!
