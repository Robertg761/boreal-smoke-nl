# Securing Google Maps API Key

## IMPORTANT: The API key in AndroidManifest.xml has been exposed and must be rotated immediately!

## Steps to Secure Your API Key:

### 1. Rotate the Exposed Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Delete or regenerate the exposed key
4. Create a new API key

### 2. Restrict the New API Key
In Google Cloud Console, add these restrictions:
- **Application restrictions:** Android apps
- **Package name:** `com.borealsmokenl`
- **SHA-1 fingerprints:** Add both debug and release certificates

### 3. Store Key Securely (Choose one method):

#### Method A: Using local.properties (Recommended for Development)
1. Add to `android/local.properties`:
   ```
   MAPS_API_KEY=your_actual_api_key_here
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   def localProperties = new Properties()
   def localPropertiesFile = rootProject.file('local.properties')
   if (localPropertiesFile.exists()) {
       localPropertiesFile.withInputStream { stream ->
           localProperties.load(stream)
       }
   }
   
   android {
       defaultConfig {
           manifestPlaceholders = [
               mapsApiKey: localProperties.getProperty('MAPS_API_KEY', '')
           ]
       }
   }
   ```

3. Update `AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="${mapsApiKey}"/>
   ```

#### Method B: Using Environment Variables (Good for CI/CD)
1. Set environment variable:
   ```bash
   export MAPS_API_KEY=your_actual_api_key_here
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           manifestPlaceholders = [
               mapsApiKey: System.getenv("MAPS_API_KEY") ?: ""
           ]
       }
   }
   ```

### 4. Add to .gitignore
Make sure these are in your `.gitignore`:
```
# API Keys
android/local.properties
*.keystore
.env
.env.local
```

### 5. For iOS
Store the iOS key similarly in a config file that's not committed to git, and load it at runtime.

## Security Checklist:
- [ ] Old API key has been rotated/deleted
- [ ] New API key has proper restrictions (package name, SHA-1)
- [ ] API key is not hardcoded in any committed files
- [ ] local.properties is in .gitignore
- [ ] Documentation updated for team members
