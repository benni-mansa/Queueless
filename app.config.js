export default {
  expo: {
    name: "Hospital Queue",
    slug: "hospital-queue",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.queueless.hospitalqueue"
    },
    android: {
      package: "com.queueless.hospitalqueue",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      eas: {
        projectId: "226864c7-bdcc-44db-885f-611ded637195"
      }
    },
    plugins: [
      "expo-secure-store",
      "expo-notifications"
    ],
    notification: {
      icon: "./assets/notification-icon.png",
      color: "#2563EB",
      iosDisplayInForeground: true,
      androidMode: "default",
      androidCollapsedTitle: "Hospital Queue"
    }
  }
};
