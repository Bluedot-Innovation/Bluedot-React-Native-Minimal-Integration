/**
 * Feature flags for the minimal integration app.
 *
 * FIREBASE_ENABLED — set to true only when you have a valid
 *   google-services.json (Android) / GoogleService-Info.plist (iOS)
 *   AND firebaseEnabled=true in android/gradle.properties.
 *   When false, all Firebase / FCM push-notification wiring is skipped.
 */
export const FIREBASE_ENABLED = true;
