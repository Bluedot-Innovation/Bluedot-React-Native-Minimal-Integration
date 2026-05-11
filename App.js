import React from 'react';
import { Alert } from 'react-native';
import { NativeRouter, Route, Routes } from "react-router-native";
import { StatusBar } from 'expo-status-bar';
import {
  requestAllPermissions,
} from "./helpers/permissionsHandler";

import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";
import PushNotifications from 'bluedot-react-native-pushnotifications';

export default function App() {

  const showPushMessage = (title, body) => {
    Alert.alert(title || 'Notification', body || title || 'Notification received');
  };

  React.useEffect(() => {
    requestAllPermissions();

    const receivedSub = PushNotifications.on(
      PushNotifications.PUSH_NOTIFICATION_RECEIVED,
      (data) => {
        console.log('[Bluedot] Push notification received:', data.title, data.campaignId);
        showPushMessage(data.title || 'Notification received', data.body || data.title);
      }
    );

    const clickedSub = PushNotifications.on(
        PushNotifications.PUSH_NOTIFICATION_CLICKED,
        (data) => {
          console.log('[Bluedot] Push notification clicked:', data.title, data.campaignId);
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
    </NativeRouter>
  );
}
