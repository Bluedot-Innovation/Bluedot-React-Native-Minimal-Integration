import { Platform } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Importance } from "react-native-push-notification";
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
            isSilent: true
        })
    }

    if (Platform.OS === OS.ANDROID) {
       console.log("Sending Android create channel")
        PushNotification.createChannel({
            channelId: channelId,
            channelName: "Bluedot SDK",
            importance: Importance.HIGH
        },  (created) => console.log(`createChannel returned '${created}'`))

       console.log("Sending Android Local Notification")
        PushNotification.localNotification({
            channelId: channelId,
            title: title,
            message: message,
            playSound: false,
            smallIcon: "ic_notification"
        })
    }
}
