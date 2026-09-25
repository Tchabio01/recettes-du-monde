import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const APP_NAME = "Recettes du Monde";

export const ENV = {
  supabaseUrl: extra.supabaseUrl as string,
  supabaseAnonKey: extra.supabaseAnonKey as string,
  revenueCatApiKeyIos: extra.revenueCatApiKeyIos as string,
  revenueCatApiKeyAndroid: extra.revenueCatApiKeyAndroid as string,
  posthogApiKey: extra.posthogApiKey as string,
  posthogHost: (extra.posthogHost as string) ?? "https://app.posthog.com",
  sentryDsn: extra.sentryDsn as string,
};

export const MONETIZATION = {
  removeAdsPriceLabel: "2,99 €",
  premiumMonthlyPriceLabel: "1,99 €/mois",
  removeAdsProductId: "remove_ads_lifetime",
  premiumSubscriptionId: "premium_monthly",
  interstitialAfterNRecipes: 3,
  nativeAdEveryNItems: 5,
};

export const DIET_LABELS: Record<string, string> = {
  classique: "Classique",
  vegetarien: "Végétarien",
  vegan: "Vegan",
  sans_gluten: "Sans gluten",
  sans_lactose: "Sans lactose",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};

export const STORAGE_KEYS = {
  onboardingDone: "onboarding_done",
  cachedRecipes: "cached_recipes",
  adsRemovedUntil: "ads_removed_until_24h",
  sessionRecipeViews: "session_recipe_views",
};
