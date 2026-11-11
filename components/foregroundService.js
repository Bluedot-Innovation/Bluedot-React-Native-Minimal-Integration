import { NativeModules, Platform } from "react-native";
import BluedotPointSdk from "bluedot-react-native";
import { OS } from "../enums";

// App-owned Android foreground service (BluedotTrackingService.java).
// Since bluedot-react-native 4.0.0 the SDK no longer posts its own foreground
// notification: the app must start its own service and link it to the SDK.
// start() resolves once the service is in the foreground and linked.
export function startForegroundService() {
  if (Platform.OS !== OS.ANDROID) return Promise.resolve();
  return NativeModules.BluedotTrackingService.start();
}

export function stopForegroundService() {
  if (Platform.OS !== OS.ANDROID) return Promise.resolve();
  return NativeModules.BluedotTrackingService.stop();
}

// Shared lifecycle cleanup. The app-owned service is independent of the SDK, so
// it must be stopped explicitly. Stop it only once neither GeoTriggering nor
// Tempo is running, so an active (or still-starting) tracker is never left
// without its service, and a stopped/failed tracker never leaves the service
// and its ongoing notification running.
export async function stopForegroundServiceIfIdle() {
  if (Platform.OS !== OS.ANDROID) return;
  const [isGeoTriggeringRunning, isTempoRunning] = await Promise.all([
    BluedotPointSdk.isGeoTriggeringRunning(),
    BluedotPointSdk.isTempoRunning(),
  ]);
  if (!isGeoTriggeringRunning && !isTempoRunning) {
    await stopForegroundService();
  }
}
