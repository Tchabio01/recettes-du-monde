import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.recettesdumonde.app.dev";
  if (IS_PREVIEW) return "com.recettesdumonde.app.preview";
  return "com.recettesdumonde.app";
};

const getAppName = () => {
  if (IS_DEV) return "Recettes du Monde (Dev)";
  if (IS_PREVIEW) return "Recettes du Monde (Preview)";
  return "Recettes du Monde";
};

// IDs App AdMob (identifiants d'App, différents des IDs de blocs d'annonces)
// Remplacer par les vrais IDs d'app en production via variables d'env EAS.
const ADMOB_ANDROID_APP_ID =
  process.env.ADMOB_ANDROID_APP_ID ?? "ca-app-pub-3940256099942544~3347511713";
const ADMOB_IOS_APP_ID =
  process.env.ADMOB_IOS_APP_ID ?? "ca-app-pub-3940256099942544~1458002511";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "recettes-du-monde",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "recettesdumonde",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FF7A00",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    buildNumber: "1",
    infoPlist: {
      NSUserTrackingUsageDescription:
        "Nous utilisons ces données pour vous proposer des publicités plus pertinentes.",
      ITSAppUsesNonExemptEncryption: false,
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: getUniqueIdentifier(),
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FF7A00",
    },
    permissions: [
      "com.google.android.gms.permission.AD_ID",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
    ],
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-tracking-transparency",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#FF7A00",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#FF7A00",
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
        iosAppId: ADMOB_IOS_APP_ID,
        userTrackingUsageDescription:
          "Nous utilisons ces données pour vous proposer des publicités plus pertinentes.",
        skAdNetworkItems: [
          "cstr6suwn9.skadnetwork",
          "4fzdc2evr5.skadnetwork",
          "2fnua5tdw4.skadnetwork",
          "ydx93a7ass.skadnetwork",
        ],
      },
    ],
    "@sentry/react-native/expo",
    [
      "expo-build-properties",
      {
        ios: { useFrameworks: "static" },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "REPLACE_WITH_EAS_PROJECT_ID",
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenueCatApiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
  owner: "REPLACE_WITH_EXPO_OWNER",
});
