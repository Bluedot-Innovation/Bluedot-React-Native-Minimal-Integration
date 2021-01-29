import { Platform } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification"
import { OS } from '../enums'

export const sendLocalNotification = (message) => {
    const title = 'BluedotPointSdk'

    if (Platform.OS === OS.IOS) {
        PushNotificationIOS.addNotificationRequest({
            id: "notification",
            title,
            body: message,
            isSilent: true
        })
    }

    if (Platform.OS === OS.ANDROID) {
        PushNotification.localNotification({
            title,
            message,
            playSound: false,
            smallIcon: "ic_launcher"
        })
    }
}