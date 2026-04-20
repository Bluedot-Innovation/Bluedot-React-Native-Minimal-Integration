import React from 'react';
import { NativeRouter, Route, Routes } from "react-router-native";
import { StatusBar } from 'expo-status-bar';
import {
  requestAllPermissions,
} from "./helpers/permissionsHandler";
import PushNotifications from 'bluedot-react-native-pushnotifications';
import Toast from 'react-native-toast-message';

import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";

// Forward background / quit-state FCM messages to the Bluedot Push SDK.
// if (FIREBASE_ENABLED) {
//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     PushNotifications.onMessageReceived(remoteMessage);
//   });
// }

export default function App() {

  React.useEffect(() => {
    requestAllPermissions();

    // Forward FCM token updates and foreground messages to the Bluedot Push SDK.
    // Skipped when FIREBASE_ENABLED is false (no google-services config present).
    // const unsubscribeToken = FIREBASE_ENABLED
    //   ? messaging().onTokenRefresh(token => { PushNotifications.onNewFcmToken(token); })
    //   : () => {};

    // const unsubscribeMessage = FIREBASE_ENABLED
    //   ? messaging().onMessage(async remoteMessage => { PushNotifications.onMessageReceived(remoteMessage); })
    //   : () => {};

    // Listen for push notification tap/display events from Bluedot campaigns
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
      receivedSub.remove();
      clickedSub.remove();
    };
  }, []);

  return (
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
  );
}
