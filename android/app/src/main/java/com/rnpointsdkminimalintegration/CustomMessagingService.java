package com.rnpointsdkminimalintegration;

import android.util.Log;

import au.com.bluedot.point.net.engine.ServiceManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.rezolve.pushnotifications.PushUtilsKt;

/**
 * Custom implementation of FirebaseMessagingService to forward push notifications to the bluedot-react-native-pushnotifications package.
 * This is optional - if you don't need to do any custom handling of push notifications you can skip this class. 
 * The bluedot-react-native-pushnotifications package provides a default implementation that will forward notifications to the PointSDK.
 */
public class CustomMessagingService extends FirebaseMessagingService {

    private static final String TAG = "CustomMessagingService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom() + ", data: " + remoteMessage.getData());
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "title: " + remoteMessage.getNotification().getTitle());
            Log.d(TAG, "body: " + remoteMessage.getNotification().getBody());
        }
        if (PushUtilsKt.isRezolvePushNotification(remoteMessage)) {
            ServiceManager.getInstance(this).getPushNotificationsManager().onMessageReceived(PushUtilsKt.toRezolvePushData(remoteMessage));
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        ServiceManager.getInstance(this).getPushNotificationsManager().onNewFcmToken(token);
    }
}
