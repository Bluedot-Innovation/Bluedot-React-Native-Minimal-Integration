package com.rnpointsdkminimalintegration;

import static com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative;
import static com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.res.Configuration;
import android.os.Build;
import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;
import android.app.Application;
import androidx.annotation.NonNull;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.soloader.OpenSourceMergedSoMapping;
import com.facebook.soloader.SoLoader;
import java.io.IOException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private static final String AIRSHIP_DEFAULT_CHANNEL_ID = "BluedotSDK";

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {
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
      });

  @Override
  public ReactHost getReactHost() {
    return getDefaultReactHost(this, mReactNativeHost, null);
  }

  @NonNull
  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    loadReactNative(this);
    createDefaultNotificationChannel();
    ApplicationLifecycleDispatcher.onApplicationCreate(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }

  private void createDefaultNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return;
    }

    NotificationManager notificationManager = getSystemService(NotificationManager.class);
    if (notificationManager == null || notificationManager.getNotificationChannel(AIRSHIP_DEFAULT_CHANNEL_ID) != null) {
      return;
    }

    NotificationChannel channel = new NotificationChannel(
        AIRSHIP_DEFAULT_CHANNEL_ID,
        getString(R.string.airship_default_channel_name),
        NotificationManager.IMPORTANCE_DEFAULT
    );
    channel.setDescription(getString(R.string.airship_default_channel_description));
    notificationManager.createNotificationChannel(channel);
  }
}
