import React from 'react';
import { Alert } from 'react-native';
import { NativeRouter, Route, Routes } from "react-router-native";
import { StatusBar } from 'expo-status-bar';
import { requestAllPermissions } from "./helpers/permissionsHandler";
import Toast from 'react-native-toast-message';

import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";
import PushNotifications from 'bluedot-react-native-pushnotifications';

// If you implement Firebase on the React Native layer, forward background/quit-state FCM messages to the Bluedot Push SDK.
// Call this once at the module level (outside any component):
//
// if (PUSH_ENABLED) {
//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     PushNotifications.onMessageReceived(remoteMessage);
//   });
// }

export default function App() {

  const showPushMessage = (title, body) => {
    Alert.alert(title || 'Notification', body || title || 'Notification received');
  };

  React.useEffect(() => {
    requestAllPermissions();

    // Forward FCM token updates and foreground messages to the Bluedot Push SDK.
    // Skipped when PUSH_ENABLED is false (no google-services config present).
    // const unsubscribeToken = PUSH_ENABLED
    //   ? messaging().onTokenRefresh(token => { PushNotifications.onNewFcmToken(token); })
    //   : () => {};

    // const unsubscribeMessage = PUSH_ENABLED
    //   ? messaging().onMessage(async remoteMessage => { PushNotifications.onMessageReceived(remoteMessage); })
    //   : () => {};

    // Listen for push notification tap/display events from Bluedot campaigns

    // Payload keys are consistent across platforms; on iOS `body`, `pushVersion` and `data` are null.
    const receivedSub = PushNotifications.on(
      PushNotifications.PUSH_NOTIFICATION_RECEIVED,
      (data) => {
        console.log('[Bluedot] Push notification received:', {
          title: data.title,
          body: data.body,
          pushVersion: data.pushVersion,
          campaignId: data.campaignId,
          zoneId: data.zoneId,
          notificationId: data.notificationId,
          data: data.data,
        });
        showPushMessage(data.title || 'Notification received', data.body || data.title);
      }
    );

    const clickedSub = PushNotifications.on(
        PushNotifications.PUSH_NOTIFICATION_CLICKED,
        (data) => {
          console.log('[Bluedot] Push notification clicked:', {
            title: data.title,
            campaignId: data.campaignId,
            zoneId: data.zoneId,
            notificationId: data.notificationId,
          });
          showPushMessage(data.title || 'Notification clicked', data.body || data.title);
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
