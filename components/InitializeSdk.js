import React, { useState, useEffect } from "react";
import BluedotPointSdk from "bluedot-react-native";
import { useNavigate } from "react-router";
import { Button, Text, TextInput, View } from "react-native";
import { sendLocalNotification } from "../helpers/notifications";
import styles from "../styles";

const PROJECTID = "7c285bc1-6fe2-432a-8b37-6cdd68c1306e";

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
    });

    BluedotPointSdk.on("exitZone", (event) => {
      const message = `You have checked-out from ${event.zoneInfo.name}`;
      sendLocalNotification(message);
    });

    BluedotPointSdk.on("zoneInfoUpdate", () => {
      BluedotPointSdk.getZonesAndFences()
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
  );
}
