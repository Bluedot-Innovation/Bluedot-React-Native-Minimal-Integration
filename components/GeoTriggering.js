import React, { useState, useEffect } from "react";
import { Button, Platform, Text, View, Switch } from "react-native";
import { useNavigate } from "react-router";
import BluedotPointSdk from "bluedot-react-native";
import styles from "../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OS } from "../enums";
import { startForegroundService, stopForegroundService } from "./foregroundService";

export default function GeoTriggering() {

  const navigate = useNavigate();
  const [isGeotriggeringRunning, setIsGeotriggeringRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isBackgroundLocationUpdatesEnabled, setIsBackgroundLocationUpdatesEnabled] = useState(false);
  const allowsBackgroundLocationUpdatesString = "allowsBackgroundLocationUpdates";
  const toggleSwitch = async (value) => {
    setIsBackgroundLocationUpdatesEnabled(value);
    BluedotPointSdk.backgroundLocationAccessForWhileUsing(value);
    try {
    await AsyncStorage.setItem(allowsBackgroundLocationUpdatesString, value.toString());
    } catch (e) {
      console.log(e);
    }
  };

  const geoTriggeringBuilder = new BluedotPointSdk.GeoTriggeringBuilder();
  let isBackgroundLocationUpdatesEnabledString = `Is Background Location Enabled: ${isBackgroundLocationUpdatesEnabled}`;

   useEffect(() => {
       BluedotPointSdk.isGeoTriggeringRunning().then((isRunning) => {
         setIsGeotriggeringRunning(isRunning);
         console.log("ABCD from GeoTrigger ",isRunning);
       });

    const retrieveBackgroundLocationStatus = async () => {
      try {
        const isBackgroundLocationUpdatesAllowed = ((await AsyncStorage.getItem(allowsBackgroundLocationUpdatesString) || BluedotPointSdk.backgroundLocationAccessForWhileUsing) === 'true')
        if(isBackgroundLocationUpdatesAllowed !== null) {
          setIsBackgroundLocationUpdatesEnabled(isBackgroundLocationUpdatesAllowed);
        }
      } catch(e) {
        console.log(e);
      }
    };
    
    retrieveBackgroundLocationStatus();

  }, []);

  const handleStartGeotriggering = () => {
    const onSuccessCallback = () => setIsGeotriggeringRunning(true)
    const onFailCallback = (error) => setError(error);

    if(Platform.OS === OS.ANDROID) {
       geoTriggeringBuilder.start(onSuccessCallback, onFailCallback);
    } else {
       geoTriggeringBuilder
         .iOSAppRestartNotification("Press here to restart the app", "Press here to restart the app")
         .start(onSuccessCallback, onFailCallback);
    }
  };

  const handleStartGeotriggeringWithAndroidNotification = () => {
    const onSuccessCallback = () => setIsGeotriggeringRunning(true);
    const onFailCallback = (error) => setError(error);

    // Start and link the app's foreground service first so the ongoing
    // notification is shown and GeoTriggering runs in high-accuracy mode.
    startForegroundService()
      .then(() => geoTriggeringBuilder.start(onSuccessCallback, onFailCallback))
      .catch((e) => setError(e.message));
  };

  const handleStopGeotriggering = () => {
    function onSuccessCallback() {
      setIsGeotriggeringRunning(false);
      // Stopping the service unlinks it, which would also stop Tempo.
      BluedotPointSdk.isTempoRunning().then((isTempoRunning) => {
        if (!isTempoRunning) stopForegroundService();
      });
    }
    function onFailCallback(error) {
      setError(error);
    }

    BluedotPointSdk.stopGeoTriggering(onSuccessCallback, onFailCallback);
  };

  const renderStartButtons = () => {
    return (
      <>
        {Platform.OS === OS.ANDROID && (
          <Button
            title={"Start with foreground notification"}
            onPress={handleStartGeotriggeringWithAndroidNotification}
            style={styles.button}
          />
        )}

        <Button
          title={"Start"}
          onPress={handleStartGeotriggering}
          style={styles.button}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eventTitle}>Geo Triggering</Text>
      {error ? <Text>Error: {error}</Text> : null}
      {Platform.OS === OS.IOS && <>
        <Text>Allow Background Location Updates</Text>
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Switch
            onValueChange={toggleSwitch}
            value={isBackgroundLocationUpdatesEnabled}
          />
        </View>
        <Text>{isBackgroundLocationUpdatesEnabledString}</Text>
      </>}
      {isGeotriggeringRunning ? (
        <Button
          title={"Stop"}
          onPress={handleStopGeotriggering}
          style={styles.button}
        />
      ) : (
        renderStartButtons()
      )}
      <Button
        title="Back"
        onPress={() => navigate("/main")}
        style={styles.button}
      />

    </View>
  );
}