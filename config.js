/**
 * Feature flags for the minimal integration app.
 *
 * Values are driven by the root .env file and surfaced at runtime via
 * react-native-config — edit .env to change them.
 *
 * FIREBASE_ENABLED — set to true only when you have a valid
 *   google-services.json (Android) / GoogleService-Info.plist (iOS).
 *   When false, all Firebase / FCM push-notification wiring is skipped.
 */
import Config from 'react-native-config';

export const FIREBASE_ENABLED = Config.FIREBASE_ENABLED === 'true';
