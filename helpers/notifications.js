import { Platform } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification"
import { OS } from '../enums'

export const sendLocalNotification = (message) => {
    const title = 'BluedotPointSdk'
    const channelId = "BluedotSDK"

    if (Platform.OS === OS.IOS) {
        PushNotificationIOS.addNotificationRequest({
            id: (new Date()).toString(),
            title,
            body: message,
            isSilent: false
        })
    }

    if (Platform.OS === OS.ANDROID) {
        PushNotification.createChannel({
            channelId: channelId,
            channelName: "Bluedot SDK"
        })

        PushNotification.localNotification({
            channelId: channelId,
            title: title,
            message: message,
            playSound: false,
            smallIcon: "ic_notification"
        })
    }
}
