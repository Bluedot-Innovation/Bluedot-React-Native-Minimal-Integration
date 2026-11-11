package com.rnpointsdkminimalintegration;

import android.content.Intent;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BluedotTrackingServiceModule extends ReactContextBaseJavaModule {

    private static Promise pendingStartPromise;

    public BluedotTrackingServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() { return "BluedotTrackingService"; }

    /**
     * Starts BluedotTrackingService. The promise resolves once the service has called
     * startForeground() and linked itself to the Bluedot SDK, so it is safe to start
     * Tempo / GeoTriggering after it resolves.
     */
    @ReactMethod
    public void start(Promise promise) {
        synchronized (BluedotTrackingServiceModule.class) {
            if (pendingStartPromise != null) {
                pendingStartPromise.reject("start_superseded", "A newer start() call replaced this one");
            }
            pendingStartPromise = promise;
        }
        try {
            Intent intent = new Intent(getReactApplicationContext(), BluedotTrackingService.class);
            getReactApplicationContext().startForegroundService(intent);
        } catch (Exception e) {
            onServiceStartResult(e);
        }
    }

    @ReactMethod
    public void stop(Promise promise) {
        Intent intent = new Intent(getReactApplicationContext(), BluedotTrackingService.class);
        getReactApplicationContext().stopService(intent);
        promise.resolve(null);
    }

    static void onServiceStartResult(Exception error) {
        Promise promise;
        synchronized (BluedotTrackingServiceModule.class) {
            promise = pendingStartPromise;
            pendingStartPromise = null;
        }
        if (promise == null) return;
        if (error == null) {
            promise.resolve(null);
        } else {
            promise.reject("foreground_service_start_failed", error.getMessage(), error);
        }
    }
}
