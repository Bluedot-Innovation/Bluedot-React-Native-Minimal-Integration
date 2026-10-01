import { NativeModules, Platform } from "react-native";
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
