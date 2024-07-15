import React, { useState, useEffect } from "react";
import { Platform } from 'react-native';
import BluedotPointSdk from "bluedot-react-native";
import { useNavigate } from "react-router";
import { Button, Text, TextInput, View, TouchableWithoutFeedback, Keyboard} from "react-native";
import { sendLocalNotification } from "../helpers/notifications";
import styles from "../styles";
import { OS } from '../enums'

const PROJECTID = "YOUR_PROJECT_ID_GOES_HERE";

export default function Initialize() {
  const [projectId, setProjectId] = useState(PROJECTID);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);


  useEffect(() => {
    BluedotPointSdk.isInitialized().then((isInitialized) => {
      if (isInitialized) setIsSdkInitialized(true)
    });

    // Set custom event metadata.
    // We suggest to set the Custom Event Meta Data before starting GeoTriggering or Tempo.
    BluedotPointSdk.setCustomEventMetaData({
      orderId: "order_1234",
      storeId: "store_5678",
      carModel: "ford",
      carColor: "blue"
    });
  }, []);

  useEffect(() => {
    if (isSdkInitialized) navigate("/main");
  }, [isSdkInitialized])

  const registerBluedotListeners = () => {
    BluedotPointSdk.on("enterZone", (event) => {
      const message = `You have checked in ${event.zoneInfo.name}`;
      sendLocalNotification(message);
      console.log(`entered: ${JSON.stringify(event)}`);

      // Test querying CustomEventMetaData
      BluedotPointSdk.getCustomEventMetaData().then((metadata) => {
        const message = `on Entered, CustomEventMetaData: ${JSON.stringify(metadata)}`;
        console.log(message);
        console.log(JSON.stringify(metadata))
      });
    });

    BluedotPointSdk.on("exitZone", (event) => {
      const message = `You have checked-out from ${event.zoneInfo.name}`;
      sendLocalNotification(message);
      console.log(`exited: ${JSON.stringify(event)}`);
    });

    BluedotPointSdk.on("zoneInfoUpdate", () => {
      // zoneInfoUpdate callback no longer returns zoneInfos, query it directly from the SDK
      BluedotPointSdk.getZonesAndFences().then((zoneInfos) => {
        if (zoneInfos != null) {
          const message = `Did Update ZoneInfo ${JSON.stringify(zoneInfos)}`;
          console.log(message);
          console.log(JSON.stringify(zoneInfos))
        }
      });
    });

    BluedotPointSdk.on(
      "lowPowerModeDidChange",
      (event) => console.log(JSON.stringify(event))
    );

    BluedotPointSdk.on(
      "locationAuthorizationDidChange",
      (event) => console.log(JSON.stringify(event))
    );

    BluedotPointSdk.on(
      // This event is exclusive for iOS Location Accuracy (Precise: on/off)
      "accuracyAuthorizationDidChange",
      (event) => console.log(JSON.stringify(event))
    );
  };

  function handleInitializeSDK() {
    function onSuccess() {
      registerBluedotListeners();
      navigate("/main");
    }

    function onFail(error) {
      // For App Restart Notification checks if the SDK is already running.
      BluedotPointSdk.isInitialized().then((isInitialized) => {
        if (isInitialized) {
          setIsSdkInitialized(true)
        } else {
          setError(error);
        }
      });
    }
    BluedotPointSdk.initialize(projectId, onSuccess, onFail);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Bluedot React Native</Text>
        </View>

        <Text style={styles.eventTitle}>Project ID</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setProjectId}
          value={projectId}
          placeholder="Use your project Id here"
        />

        {error !== null && <Text>Error authenticating {error}</Text>}

        <Button
          title="Initialize"
          onPress={handleInitializeSDK}
          disabled={Boolean(!projectId)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
