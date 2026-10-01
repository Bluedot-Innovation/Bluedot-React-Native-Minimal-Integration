package com.rnpointsdkminimalintegration;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import au.com.bluedot.point.net.engine.ServiceManager;

public class BluedotTrackingService extends Service {

    private static final String TAG = "BluedotTrackingService";
    private static final int NOTIFICATION_ID = 9001;
    private static final String CHANNEL_ID = "Bluedot React";

    private Exception startError;

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            startForeground(NOTIFICATION_ID, buildNotification());
            ServiceManager.getInstance(getApplicationContext()).linkForegroundService();
        } catch (Exception e) {
            // startForeground can throw on API 31+ if called from the background,
            // or on API 34+ if FOREGROUND_SERVICE_LOCATION permission is missing.
            Log.e(TAG, "Failed to start foreground service", e);
            startError = e;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Runs after onCreate() on the first start and on every subsequent start,
        // so the JS caller is always notified once the link has (or hasn't) happened.
        BluedotTrackingServiceModule.onServiceStartResult(startError);
        if (startError != null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (startError == null) {
            ServiceManager.getInstance(getApplicationContext()).unlinkForegroundService();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Notification buildNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm.getNotificationChannel(CHANNEL_ID) == null) {
                nm.createNotificationChannel(new NotificationChannel(CHANNEL_ID,
                        "Bluedot React", NotificationManager.IMPORTANCE_LOW));
            }
            return new Notification.Builder(this, CHANNEL_ID)
                    .setContentTitle("Bluedot Foreground Service")
                    .setContentText("This app is running a foreground service using location services")
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .setOngoing(true)
                    .build();
        } else {
            return new Notification.Builder(this)
                    .setContentTitle("Bluedot Foreground Service")
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .build();
        }
    }
}
