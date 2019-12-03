package com.reactlibrary;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import au.com.bluedot.application.model.Proximity;
import au.com.bluedot.point.ApplicationNotificationListener;
import au.com.bluedot.point.net.engine.BeaconInfo;
import au.com.bluedot.point.net.engine.FenceInfo;
import au.com.bluedot.point.net.engine.LocationInfo;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import au.com.bluedot.point.ServiceStatusListener;
import au.com.bluedot.point.net.engine.BDError;
import au.com.bluedot.point.net.engine.ServiceManager;
import au.com.bluedot.point.net.engine.ZoneInfo;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.util.List;
import java.util.Map;

import static android.app.Notification.PRIORITY_MAX;

public class BluedotPointSdkModule extends ReactContextBaseJavaModule
        implements ServiceStatusListener, ApplicationNotificationListener {

    private final ReactApplicationContext reactContext;
    ServiceManager serviceManager;
    private Callback logOutCallback;

    public BluedotPointSdkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        serviceManager = ServiceManager.getInstance(reactContext);
    }

    @Override
    public String getName() {
        return "BluedotPointSdk";
    }

    private void sendEvent(ReactContext reactContext,
            String eventName,
            @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void sampleMethod(String stringArgument, int numberArgument, Callback callback) {
        // TODO: Implement some actually useful functionality
        callback.invoke("Received numberArgument: " + numberArgument + " stringArgument: " + stringArgument);
    }

    @ReactMethod
    public void authenticate(String apiKey, String permLevel, Callback success,Callback fail){
        if(apiKey.equals(" "))
            apiKey="0811c6a0-0251-11e9-aebf-02e673959816";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if(reactContext.checkSelfPermission(
                    Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ) {
                //serviceManager.setForegroundServiceNotification(createNotification(), false);
                serviceManager.sendAuthenticationRequest(apiKey, this);
                success.invoke("Success");
            }
        }
    }

    @ReactMethod
    public void logout(Callback callback){
        logOutCallback = callback;
        serviceManager.stopPointService();
    }

    @ReactMethod
    public void setForeground(String channelId, String channelName, String title, String content){
        serviceManager.setForegroundServiceNotification(createNotification(channelId,channelName,title,content), false);
    }

    private Notification createNotification(String channelId,String channelName,String title, String content) {

        Intent activityIntent = new Intent(this.getCurrentActivity().getIntent());
        activityIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(reactContext, 0,
                activityIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationManager notificationManager =
                (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (notificationManager.getNotificationChannel(channelId) == null) {
                NotificationChannel notificationChannel =
                        new NotificationChannel(channelId, channelName,
                                NotificationManager.IMPORTANCE_HIGH);
                notificationChannel.enableLights(false);
                notificationChannel.setLightColor(Color.RED);
                notificationChannel.enableVibration(false);
                notificationManager.createNotificationChannel(notificationChannel);
            }
            Notification.Builder notification = new Notification.Builder(reactContext, channelId)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setStyle(new Notification.BigTextStyle().bigText(content))
                    .setOngoing(true)
                    .setCategory(Notification.CATEGORY_SERVICE)
                    .setContentIntent(pendingIntent)
                    .setSmallIcon(R.mipmap.ic_launcher);
            return notification.build();
        } else {
            NotificationCompat.Builder notification = new NotificationCompat.Builder(reactContext)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(content))
                    .setOngoing(true)
                    .setCategory(Notification.CATEGORY_SERVICE)
                    .setPriority(PRIORITY_MAX)
                    .setContentIntent(pendingIntent)
                    .setSmallIcon(R.mipmap.ic_launcher);
            return notification.build();
        }
    }
    @Override public void onBlueDotPointServiceStartedSuccess() {
        serviceManager.subscribeForApplicationNotification(this);
    }

    @Override public void onBlueDotPointServiceStop() {
        if (logOutCallback != null) {
            logOutCallback.invoke("Success");
        }
        serviceManager.unsubscribeForApplicationNotification(this);

    }

    @Override public void onBlueDotPointServiceError(BDError bdError) {

    }

    @Override public void onRuleUpdate(List<ZoneInfo> list) {
        WritableArray zoneList = new WritableNativeArray();
        if(list != null) {
            for (int i = 0; i < list.size(); i++) {
                WritableMap zone = new WritableNativeMap();
                zone.putString("name",list.get(i).getZoneName());
                zone.putString("id",list.get(i).getZoneId());
                zoneList.pushMap(zone);
            }
        }
        WritableMap map = new WritableNativeMap();
        map.putArray("zoneList",zoneList);
        sendEvent(reactContext, "ZoneInfo",map);
    }

    @Override
    public void onCheckIntoFence(FenceInfo fenceInfo, ZoneInfo zoneInfo, LocationInfo locationInfo,
            Map<String, String> map, boolean b) {

    }

    @Override public void onCheckedOutFromFence(FenceInfo fenceInfo, ZoneInfo zoneInfo, int i,
            Map<String, String> map) {

    }

    @Override public void onCheckIntoBeacon(BeaconInfo beaconInfo, ZoneInfo zoneInfo,
            LocationInfo locationInfo, Proximity proximity, Map<String, String> map, boolean b) {

    }

    @Override public void onCheckedOutFromBeacon(BeaconInfo beaconInfo, ZoneInfo zoneInfo, int i,
            Map<String, String> map) {

    }
}
