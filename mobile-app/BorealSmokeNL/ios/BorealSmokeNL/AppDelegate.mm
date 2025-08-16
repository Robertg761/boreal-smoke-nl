#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BorealSmokeNL";
  
  // Initialize Google Maps SDK
  // IMPORTANT: This API key should be moved to a secure configuration file
  // DO NOT commit this key to version control
  // iOS-specific API key (restricted to bundle ID: org.reactjs.native.example.BorealSmokeNL)
  NSString *apiKey = @"AIzaSyAG9WYo781_nPcrOFjkHzudD6SH7lpKstw";
  
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
