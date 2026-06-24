//
//  BluedotPushBridge.m
//  RNPointSDKMinimalIntegration
//
//  Created by Natalia Klymenko on 7/5/2026.
//

#import "BluedotPushBridge.h"
#import <BDPointSDK/BDPointSDK.h>
#import <BDPointSDK/BDPointSDK-Swift.h>

@implementation BluedotPushBridge

+ (BOOL)handleForegroundNotification:(UNNotification *)notification
{
  return [[BDLocationManager instance].pushNotifications handleForeground:notification];
}

+ (void)registerDeviceToken:(NSData *)deviceToken
{
  [[BDLocationManager instance].pushNotifications register:deviceToken];
}

+ (void)handleNotificationResponse:(UNNotificationResponse *)response
{
  [[BDLocationManager instance].pushNotifications handleResponse:response];
}

@end
