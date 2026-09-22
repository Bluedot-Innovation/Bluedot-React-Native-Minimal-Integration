//
//  BluedotPushBridge.h
//  RNPointSDKMinimalIntegration
//
//  Created by Natalia Klymenko on 7/5/2026.
//

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

@interface BluedotPushBridge : NSObject

+ (BOOL)handleForegroundNotification:(UNNotification *)notification;
+ (void)registerDeviceToken:(NSData *)deviceToken;
+ (void)handleNotificationResponse:(UNNotificationResponse *)response;

@end

NS_ASSUME_NONNULL_END
