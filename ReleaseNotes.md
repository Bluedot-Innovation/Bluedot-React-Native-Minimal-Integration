# Bluedot ReactNative Minimal Integration

- Using [Bluedot plugin 3.0.0](https://github.com/Bluedot-Innovation/Bluedot-React-Native-Plugin) (support react-native@>=0.69.0).
- Changes to work with breaking changes in iOS + Android 16.0.0.
- New flag to toggle Bluebar Mode in iOS: `backgroundLocationAccessForWhileUsing` 
- New Tempo callback `tempoTrackingDidUpdate:` with details of ETA + Destination available
- New SDK method to `getCustomEventMetaData` to access the current CustomEventMetaData