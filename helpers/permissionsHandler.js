import { Platform } from "react-native";
import { request, checkMultiple, requestMultiple, PERMISSIONS, requestNotifications } from "react-native-permissions";
import Geolocation from "@react-native-community/geolocation";
import { OS } from "../enums";

export const requestLocationPermissions = async () => {
  if (Platform.OS === OS.ANDROID) {
    const currentPermissions = await checkMultiple([
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    ])

    const hasLocationPermissions = currentPermissions["android.permission.ACCESS_BACKGROUND_LOCATION"] === 'granted' && currentPermissions["android.permission.ACCESS_FINE_LOCATION"] === 'granted'

    if (!hasLocationPermissions) {
      const OsVer = Platform.constants['Release'];
      console.log('OsVer', OsVer);
      //Removing requesting ACCESS_BACKGROUND_LOCATION permission for Android 11 and higher devices
      if (OsVer >= 11) {
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      } else {
        requestMultiple([
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        ]);
      }
    }
  }

  if (Platform.OS === OS.IOS) {
    Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
  });
    Geolocation.requestAuthorization();
  }
};

export const requestBluetoothPermissions = async () => {
  if (Platform.OS === OS.IOS) {
    await request(PERMISSIONS.IOS.BLUETOOTH);
  }
};

export const requestNotificationPermissions = async () => {
    requestNotifications(['alert', 'sound']).then(({ status, settings }) => {
      console.log("Notification Permission Status: " + status);
    });
};

export const requestAllPermissions = async () => {
  if (Platform.OS === OS.ANDROID) {
    const currentPermissions = await checkMultiple([
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    ])
    const hasNotificationPermission = currentPermissions["android.permission.POST_NOTIFICATIONS"] === 'granted'

    if (!hasNotificationPermission) {
      requestNotifications(['alert', 'sound']).then(({ status, settings }) => {
        console.log("Notification Permission Status: " + status);
        requestLocationPermissions();
      });
    } else {
      await requestLocationPermissions();
    }
  }

  if (Platform.OS === OS.IOS) {
    await requestBluetoothPermissions();
    requestNotifications(['alert', 'sound']).then(({ status, settings }) => {
      console.log("Notification Permission Status: " + status);

      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });
      Geolocation.requestAuthorization();
    });
  }
};

