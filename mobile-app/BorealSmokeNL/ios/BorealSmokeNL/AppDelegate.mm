#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BorealSmokeNL";
  
  // Initialize Google Maps SDK
  // Load API key from Config.xcconfig (not in version control)
  NSString *apiKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GoogleMapsAPIKey"];
  
  if (!apiKey || [apiKey length] == 0) {
    NSLog(@"⚠️ WARNING: Google Maps API key not found in Config.xcconfig");
    apiKey = @""; // Empty string to prevent crash
  }
  
  // Add debug logging
  NSLog(@"Attempting to initialize Google Maps SDK...");
  NSLog(@"API Key length: %lu", (unsigned long)[apiKey length]);
  
  BOOL result = [GMSServices provideAPIKey:apiKey];
  
  if (result) {
    NSLog(@"✅ Google Maps SDK initialized successfully with API key");
  } else {
    NSLog(@"❌ Google Maps SDK initialization failed!");
  }
  
  // Also log the bundle ID to verify it matches Google Cloud Console
  NSString *bundleID = [[NSBundle mainBundle] bundleIdentifier];
  NSLog(@"Bundle ID: %@", bundleID);
  
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
