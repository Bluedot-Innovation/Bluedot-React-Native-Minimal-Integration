package com.rnpointsdkminimalintegration;

import static com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative;
import static com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.res.Configuration;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
// import au.com.bluedot.point.net.engine.ServiceManager;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.soloader.OpenSourceMergedSoMapping;
import com.facebook.soloader.SoLoader;
import expo.modules.ApplicationLifecycleDispatcher;
import java.io.IOException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }
      };

  @Override
  public ReactHost getReactHost() {
    return getDefaultReactHost(this, mReactNativeHost, null);
  }

  @NonNull
  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  private static final boolean USE_CUSTOM_PUSH_NOTIFICATION = false;
  private static final String CUSTOM_PUSH_CHANNEL_ID = "my_custom_channel";

  @Override
  public void onCreate() {
    super.onCreate();
    loadReactNative(this);
    ApplicationLifecycleDispatcher.onApplicationCreate(this);

    // applyCustomPushNotification(this, USE_CUSTOM_PUSH_NOTIFICATION);
  }

  // Optional notification customization. Please refer to official Android documentation for more details:
  // https://developer.android.com/reference/androidx/core/app/NotificationCompat.Builder
  // This setting has to be re-applied every time the app is launched, so it is recommended to place it in onCreate function of the Application class.
  // Switch USE_CUSTOM_PUSH_NOTIFICATION flag to true to enable custom push notification, or false to use default one.
  
  // private void applyCustomPushNotification(Context context, boolean enabled) {
  //   NotificationCompat.Builder builder = null;
  //   if (enabled) {
  //     registerCustomChannel(context);
  //     builder = new NotificationCompat.Builder(context, CUSTOM_PUSH_CHANNEL_ID)
  //         .setSmallIcon(R.drawable.ic_star_blue)
  //         .setPriority(NotificationCompat.PRIORITY_HIGH)
  //         .setAutoCancel(true)
  //         .setColor(ContextCompat.getColor(context, R.color.colorPrimary));
  //   }
  //   ServiceManager.getInstance(context).getPushNotificationsManager().setCustomPushNotification(builder);
  // }

  // private void registerCustomChannel(Context context) {
  //   NotificationChannel channel = new NotificationChannel(
  //       CUSTOM_PUSH_CHANNEL_ID,
  //       "Bluedot Custom Notifications",
  //       NotificationManager.IMPORTANCE_HIGH
  //   );
  //   NotificationManager notificationManager =
  //       (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
  //   notificationManager.createNotificationChannel(channel);
  // }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }
}
