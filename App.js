import React, { useState } from 'react';
import { NativeRouter, Route, Routes } from "react-router-native";
import { StatusBar } from 'expo-status-bar';
import {
  requestAllPermissions,
} from "./helpers/permissionsHandler";
import messaging from '@react-native-firebase/messaging';
import PushNotifications from 'bluedot-react-native-pushnotifications';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PushNotificationsContext } from './helpers/pushNotificationsContext';

import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";

const CUSTOM_PUSH_NOTIFICATION_KEY = 'useCustomNotification';

const CUSTOM_PUSH_CONFIG = {
  channelId:             'bluedot_custom_channel',
  channelName:           'Bluedot Custom Notifications',
  importance:            PushNotifications.IMPORTANCE_HIGH,
  smallIconResourceName: 'ic_star_blue',
  largeIconResourceName: 'ic_star_blue', // this must be a bitmap drawable, can't be a vector XML drawable
  color:                 '#b4ac0f',
  autoCancel:            true,
};

// Forward background / quit-state FCM messages to the Bluedot Push SDK.
// Re-apply (or clear) custom notification config to match the persisted toggle state.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const enabled = await AsyncStorage.getItem(CUSTOM_PUSH_NOTIFICATION_KEY);
  if (enabled === 'true') {
    PushNotifications.setCustomPushNotification(CUSTOM_PUSH_CONFIG);
  } else {
    PushNotifications.setCustomPushNotification(null);
  }
  PushNotifications.onMessageReceived(remoteMessage);
});

export default function App() {

  const [useCustomNotification, setUseCustomNotification] = useState(false);

  // Restore persisted toggle state on mount
  React.useEffect(() => {
    AsyncStorage.getItem(CUSTOM_PUSH_NOTIFICATION_KEY).then(value => {
      if (value === 'true') {
        setUseCustomNotification(true);
      }
    });
  }, []);

  // Apply custom push notification config whenever the toggle is switched on
  React.useEffect(() => {
    if (useCustomNotification) {
      PushNotifications.setCustomPushNotification(CUSTOM_PUSH_CONFIG);
    } else {
      PushNotifications.setCustomPushNotification(null);
    }
  }, [useCustomNotification]);

  // Persist the toggle value to AsyncStorage whenever the user changes it
  const handleSetUseCustomNotification = (value) => {
    setUseCustomNotification(value);
    AsyncStorage.setItem(CUSTOM_PUSH_NOTIFICATION_KEY, value.toString());
  };

  React.useEffect(() => {
    requestAllPermissions();

    // Forward FCM token updates to the Bluedot Push SDK
    const unsubscribeToken = messaging().onTokenRefresh(token => {
      PushNotifications.onNewFcmToken(token);
    });

    // Forward foreground FCM messages to the Bluedot Push SDK
    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      PushNotifications.onMessageReceived(remoteMessage);
    });

    // Listen for push notification events from Bluedot campaigns
    const receivedSub = PushNotifications.on(
      PushNotifications.PUSH_NOTIFICATION_RECEIVED,
      (data) => {
        console.log('[Bluedot] Push notification received:', data.title, data.campaignId);
        Toast.show({
          type: 'info',
          text1: data.title || 'Notification received',
          text2: data.body || `${data.title}`,
        });
      }
    );

    const clickedSub = PushNotifications.on(
      PushNotifications.PUSH_NOTIFICATION_CLICKED,
      (data) => {
        console.log('[Bluedot] Push notification clicked:', data.title, data.campaignId);
        Toast.show({
          type: 'success',
          text1: data.title || 'Notification clicked',
          text2: data.body || `${data.title}`,
        });
      }
    );

    return () => {
      unsubscribeToken();
      unsubscribeMessage();
      receivedSub.remove();
      clickedSub.remove();
    };
  }, []);

  return (
    <PushNotificationsContext.Provider value={{ useCustomNotification, setUseCustomNotification: handleSetUseCustomNotification }}>
      <NativeRouter>
        <StatusBar style="dark" />
        <Routes>
          <Route exact path="/" element={<Initilize />} />
          <Route exact path="/main" element={<Main />} />
          <Route exact path="/geotriggering" element={<GeoTriggering />} />
          <Route exact path="/tempo" element={<Tempo />} />
        </Routes>
        <Toast />
      </NativeRouter>
    </PushNotificationsContext.Provider>
  );
}
