# Bluedot-React-Native-Minimal-Integration

This App is a minimal App depicting integration of Bluedot Plugin(bluedot-react-native) https://www.npmjs.com/package/bluedot-react-native with a React Native App supporting react native version 0.77.0

### Notes:

If you encounter issues while running the react native apps on iOS and Android, try these steps:

1. Clear watchman watches: `watchman watch-del-all`
2. Delete node_modules and package-lock.json and reinstall packages: `rm -rf node_modules && rm -rf package-lock.json`
3. Reinstall packages: `npm install`
4. Start fresh by resetting cache: `npm start --reset-cache`
5. Run again: `expo run:ios` or `expo run:android`
