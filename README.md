# Bluedot-React-Native-Minimal-Integration

This App is a minimal App depicting integration of Bluedot Plugin(bluedot-react-native) https://www.npmjs.com/package/bluedot-react-native with a React Native App supporting react native version 0.77.0

## Airship setup

Airship initialization is wired through `App.js` and `helpers/airship.js`.

Create a `.env` file from `.env.example` and provide your Airship credentials before testing push registration.

For remote push delivery, make sure the matching platform-native push setup is also complete, such as Firebase/APNs credentials for your Airship project.

### Native Airship push setup

- Android:
  - The app now creates the default `BluedotSDK` notification channel on launch for Airship push delivery.
  - If your Airship project uses FCM, place your `google-services.json` in `android/app/` and complete the Firebase/Airship Android transport setup for your project.
- iOS:
  - The project now includes `RNPointSDKMinimalIntegration.entitlements` with a build-specific `aps-environment` value.
  - Enable the **Push Notifications** capability for the app in Xcode and ensure the provisioning profile includes APNs support.
  - Run `pod install` after dependency updates so the Airship iOS pod is linked into the workspace.

### Notes:

If you encounter issues while running the react native apps on iOS and Android, try these steps:

1. Clear watchman watches: `watchman watch-del-all`
2. Delete node_modules and package-lock.json and reinstall packages: `rm -rf node_modules && rm -rf package-lock.json`
3. Reinstall packages: `npm install`
4. Start fresh by resetting cache: `npm start --reset-cache`
5. Run again: `expo run:ios` or `expo run:android`
