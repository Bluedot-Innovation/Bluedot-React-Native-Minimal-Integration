//
//  SceneDelegate.h
//  RNPointSDKMinimalIntegration
//
//  Copyright © 2026 Bluedot Innovation. All rights reserved.
//

#import <UIKit/UIKit.h>

/**
 * UIScene lifecycle support, required for apps built with the iOS 27 SDK.
 *
 * `RCTAppDelegate` is not UIScene aware in React Native 0.83, so the app opts out of its
 * automatic window creation (`automaticallyLoadReactNativeWindow = NO`) and this delegate
 * owns the window instead.
 */
API_AVAILABLE(ios(13.0))
@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>

@property (nonatomic, strong, nullable) UIWindow *window;

@end
