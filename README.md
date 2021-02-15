# bluedot-react-native

## Getting started

`$ npm install bluedot-react-native --save`

### Mostly automatic installation

`$ react-native link bluedot-react-native`

### For iOS
1. Install `git-lfs` 
2. Install Pods

```
$ cd ios
$ brew install git-lfs
$ git lfs install 
$ pod install
```

2. Setup your .plist file as laid out on this [documentation page](https://docs.bluedot.io/ios-sdk/ios-integrating-the-sdk/).

### For Android
1) Include Jitpack in your Maven dependencies in `build.gradle`

```
allprojects {
    repositories {
        ...

         // ADD IT HERE
        maven { 
            url "https://jitpack.io" 
        }
    }
}
```

2) Make sure Jetify is available in your development environment

`$ npx jetify`

## Usage
```javascript
import BluedotPointSdk from 'bluedot-react-native';

componentDidMount = async () => {
    // Before starting the Bluedot Point SDK ask for Location Permissions
    
    // ...

    const channelId = 'Bluedot React Native'
    const channelName = 'Bluedot React Native'
    const title = 'Bluedot Foreground Service'
    const content = "This app is running a foreground service using location services"

    // Foreground Service for Android to improve trigger rate - iOS will ignore this.
    BluedotPointSdk.setForegroundNotification(channelId, channelName, title, content, true)

    // If you would like to add custom event meta data
    BluedotPointSdk.setCustomEventMetaData({ userId: 'user_id_goes_here' })

    // Start Bluedot SDK
    BluedotPointSdk.authenticate('your_application_project_id', '<Always|WhenInUse>', () => console.log("On success"), () => console.log("On fail"))

    BluedotPointSdk.on('zoneInfoUpdate', (event) => {
      // ...
    })

    BluedotPointSdk.on('checkedIntoFence', (event) => {
      // ...
    })

    BluedotPointSdk.on('checkedOutFromFence', (event) => {
      // ...
    })

    BluedotPointSdk.on('checkedIntoBeacon', (event) => {
      // ...
    })

    BluedotPointSdk.on('checkedOutFromBeacon', (event) => {
      // ...
    })

    BluedotPointSdk.on('startRequiringUserInterventionForBluetooth', (event) => {
      // ...
    })

    BluedotPointSdk.on('stopRequiringUserInterventionForBluetooth', (event) => {
      // ...
    })

    BluedotPointSdk.on('startRequiringUserInterventionForLocationServices', (event) => {
      // ...
    })

    BluedotPointSdk.on('stopRequiringUserInterventionForLocationServices', (event) => {
      // ...
    })

    // Tempo events
    BluedotPointSdk.on('tempoStarted', () => {
      // ...
    })
    BluedotPointSdk.on('tempoStopped', () => {
      // ...
    })
    BluedotPointSdk.on('tempoStartError', (error) => {
      // ...
    })

    // Get Installation Reference.
    try {
        const installRef = await BluedotPointSdk.getInstallRef()
        console.log(installRef)
    } catch (error) {
        console.error(error)
    }

    // Check if the Bluedot SDK is already running.
    try {
        const isBluedotServiceRunning = await BluedotPointSdk.isBlueDotPointServiceRunning()
        console.log(isBluedotServiceRunning)
    } catch (error) {
        console.error(error)
    }
  }

```

## Events
#### zoneInfoUpdate
```javascript
{
    "zoneInfos": [
        {
            "ID": "zone-UUID-here",
            "name": "Your zone name here"
        }
        //...
    ]
}
```

#### checkedIntoFence
```javascript
{
    "zoneInfo": {
        "ID": "zone-UUID-here",
        "name": "Your zone name here"
    },
    "fenceInfo": {
        "ID": "fence-UUID-here",
        "name": "Your fence name here"
    },
    "locationInfo": {
        "unixDate": "Timestamp of triggering location update",
        "latitude": "Latitude of triggering location update",
        "longitude": "Longitude of triggering location update",
        "bearing": "Bearing of triggering location update (if available)",
        "speed": "speed of triggering location update (if available)",
    },
    "customData": {
        "custom-field-name": "Custom zone data field value"
    },
    "willCheckout": false // True if the zone has checkout enabled.
}
```

#### checkedOutFromFence
```javascript
{
    "zoneInfo": {
        "ID": "zone-UUID-here",
        "name": "Your zone name here"
    },
    "fenceInfo": {
        "ID": "fence-UUID-here",
        "name": "Your fence name here"
    },
    "customData": {
        "custom-field-name": "Custom zone data field value"
    },
    "dwellTime": 5 // Number of minutes the device dwelled in the zone
}
```

#### startRequiringUserInterventionForBluetooth
```javascript
{}
```
#### stopRequiringUserInterventionForBluetooth
```javascript
{}
```
#### startRequiringUserInterventionForLocationServices
```javascript
{
    "authorizationStatus": "denied" // Or: restricted, notDetermined, always, whenInUse, unknown
}
```
#### stopRequiringUserInterventionForLocationServices
```javascript
{
    "authorizationStatus": "denied" // Or: restricted, notDetermined, always, whenInUse, unknown
}
```

## Tempo

With Tempo, you can understand customers’ estimated time of arrival (ETA) via the app. 
For further information refer to [Tempo Documentation](https://docs.bluedot.io/tempo/)

#### startTempoTracking
```javascript
// Start Bluedot Tempo tracking
BluedotPointSdk.startTempoTracking('the_destinationId_goes_here', (error) => console.error("On fail", error))
```
#### stopTempoTracking
```javascript
// Stop Bluedot Tempo tracking
BluedotPointSdk.stopTempoTracking()
```

#### Tempo Events
```javascript
BluedotPointSdk.on('tempoStarted', () => {
    // ...
})

BluedotPointSdk.on('tempoStopped', () => {
    // ...
})

BluedotPointSdk.on('tempoStartError', (error) => {
    // ...
})
```