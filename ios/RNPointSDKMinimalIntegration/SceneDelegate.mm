//
//  SceneDelegate.mm
//  RNPointSDKMinimalIntegration
//
//  Copyright © 2026 Bluedot Innovation. All rights reserved.
//

#import "SceneDelegate.h"
#import "AppDelegate.h"

#import <RCTAppDelegate.h>
#import <RCTReactNativeFactory.h>

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }

  UIWindowScene *windowScene = (UIWindowScene *)scene;
  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;

  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];

  // launchOptions is nil here: under the UIScene lifecycle
  // application:didFinishLaunchingWithOptions: no longer receives them.
  [appDelegate.reactNativeFactory startReactNativeWithModuleName:appDelegate.moduleName
                                                        inWindow:self.window
                                               initialProperties:appDelegate.initialProps
                                                   launchOptions:nil];

  [self.window makeKeyAndVisible];
}

@end
