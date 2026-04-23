import { Platform } from 'react-native';
import Airship, {
  EventType,
  PromptPermissionFallback,
  iOS,
} from '@ua/react-native-airship';
import Config from 'react-native-config';


let listenersRegistered = false;
let initializationPromise = null;

const registerAirshipListeners = () => {
  console.log('[Airship] registerAirshipListeners called:');
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  Airship.addListener(EventType.ChannelCreated, ({ channelId }) => {
    console.log('[Airship] Channel created (event):', channelId);
    if (channelId) {
       console.log('[Airship] Channel ID is valid:', channelId);
    }
  });

   Airship.addListener(EventType.PushTokenReceived, ({ pushToken }) => {
     console.log('[Airship] Push token received:', pushToken);
   });

   Airship.addListener(EventType.PushNotificationStatusChangedStatus, ({ status }) => {
     console.log('[Airship] Notification status changed:', JSON.stringify(status));
     // Log individual status fields for debugging
     console.log('[Airship] - isPushTokenRegistered:', status?.isPushTokenRegistered);
     console.log('[Airship] - isOptedIn:', status?.isOptedIn);
     console.log('[Airship] - isPushPrivacyFeatureEnabled:', status?.isPushPrivacyFeatureEnabled);
   });

  Airship.addListener(EventType.NotificationResponse, ({ pushPayload, actionId }) => {
    console.log(
      '[Airship] Notification response:',
      JSON.stringify({ pushPayload, actionId }),
    );
  });
};

const configurePlatformPushBehavior = async () => {
  if (Platform.OS === 'ios') {
    await Airship.push.iOS.setNotificationOptions([
      iOS.NotificationOption.Alert,
      iOS.NotificationOption.Badge,
      iOS.NotificationOption.Sound,
    ]);

    await Airship.push.iOS.setForegroundPresentationOptions([
      iOS.ForegroundPresentationOption.List,
      iOS.ForegroundPresentationOption.Banner,
      iOS.ForegroundPresentationOption.Sound,
      iOS.ForegroundPresentationOption.Badge,
    ]);
  }
};

export const initializeAirship = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {

    try {
      // Register listeners FIRST so ChannelCreated event is never missed,
      // even if Autopilot already initialized Airship natively.
      registerAirshipListeners();

      const isFlying = await Airship.isFlying() === true;
      console.log('[Airship] isFlying:', isFlying);

      Airship.push.setUserNotificationsEnabled(true);
      await Airship.push.enableUserNotifications();

      await configurePlatformPushBehavior();

      try {
        const notificationStatus = await Airship.push.getNotificationStatus();
        console.log('[Airship] Notification status:', JSON.stringify(notificationStatus));

        if (!notificationStatus?.isPushTokenRegistered) {
          console.warn('[Airship] Warning: Push token not yet registered. Waiting for token...');
        }
      } catch (error) {
        console.log('[Airship] Failed to get Notification Status:', error);
      }

      console.log('[Airship] Initialization completed.');
      return true;
    } catch (error) {
      console.log('[Airship] Initialization failed:', error);
      initializationPromise = null;
      return false;
    }
  })();

  return initializationPromise;
};

export const requestAirshipNotificationPermission = async () => {
  const isInitialized = await initializeAirship();

  if (!isInitialized) {
    return false;
  }

  try {
    const status = await Airship.push.getNotificationStatus();

    if (status?.isUserNotificationsEnabled && status?.areNotificationsAllowed) {
      return true;
    }

    const isGranted = await Airship.push.enableUserNotifications({
      fallback: PromptPermissionFallback.SystemSettings,
    });

    console.log('[Airship] Notification permission granted:', isGranted);
    return isGranted;
  } catch (error) {
    console.log('[Airship] Notification permission request failed:', error);
    return false;
  }
};
