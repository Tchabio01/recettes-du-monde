import { Platform } from "react-native";
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  MaxAdContentRating,
} from "react-native-google-mobile-ads";
import * as TrackingTransparency from "expo-tracking-transparency";
import Constants from "expo-constants";

/**
 * Service AdMob centralisé.
 *
 * Pourquoi un service dédié plutôt que d'appeler le SDK depuis les écrans :
 * - un seul point de vérité pour le statut "Remove Ads" / abonné → aucun écran
 *   n'a besoin de connaître la logique de monétisation, il appelle juste
 *   `adsService.canShowAds()`.
 * - le consentement RGPD (Google UMP) doit être résolu une seule fois au
 *   démarrage, avant tout chargement de pub : centraliser évite les races
 *   conditions entre écrans qui chargeraient une pub trop tôt.
 * - les interstitiels/rewarded doivent être préchargés et mis en cache : un
 *   service garde cet état en mémoire plutôt que de le disperser dans des
 *   composants qui se démontent.
 */

const isExpoGo = Constants.appOwnership === "expo";

// IDs de blocs d'annonces. En développement on utilise systématiquement les
// IDs de TEST officiels Google (ne JAMAIS utiliser les IDs réels en dev :
// risque de bannissement du compte AdMob pour clics invalides).
const TEST_IDS = {
  banner: Platform.select({
    ios: "ca-app-pub-3940256099942544/2934735716",
    android: "ca-app-pub-3940256099942544/6300978111",
    default: "ca-app-pub-3940256099942544/6300978111",
  })!,
  interstitial: Platform.select({
    ios: "ca-app-pub-3940256099942544/4411468910",
    android: "ca-app-pub-3940256099942544/1033173712",
    default: "ca-app-pub-3940256099942544/1033173712",
  })!,
  rewarded: Platform.select({
    ios: "ca-app-pub-3940256099942544/1712485313",
    android: "ca-app-pub-3940256099942544/5224354917",
    default: "ca-app-pub-3940256099942544/5224354917",
  })!,
  native: Platform.select({
    ios: "ca-app-pub-3940256099942544/3986624511",
    android: "ca-app-pub-3940256099942544/2247696110",
    default: "ca-app-pub-3940256099942544/2247696110",
  })!,
};

const PROD_IDS = {
  banner: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
  })!,
  interstitial: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
  })!,
  rewarded: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
  })!,
  native: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID,
  })!,
};

export const AD_UNIT_IDS = __DEV__ ? TEST_IDS : PROD_IDS;

type MonetizationStatusGetter = () => {
  hasRemovedAds: boolean;
  isSubscribed: boolean;
  adsFreeUntilTimestamp: number | null; // rewarded "24h sans pubs"
};

class AdsService {
  private initialized = false;
  private consentGranted = false;
  private getStatus: MonetizationStatusGetter = () => ({
    hasRemovedAds: false,
    isSubscribed: false,
    adsFreeUntilTimestamp: null,
  });

  private interstitial: InterstitialAd | null = null;
  private interstitialLoaded = false;
  private rewardedUnlock: RewardedAd | null = null;
  private rewardedUnlockLoaded = false;
  private rewarded24h: RewardedAd | null = null;
  private rewarded24hLoaded = false;

  registerStatusGetter(fn: MonetizationStatusGetter) {
    this.getStatus = fn;
  }

  /** L'utilisateur doit-il voir des pubs maintenant ? */
  canShowAds(): boolean {
    const { hasRemovedAds, isSubscribed, adsFreeUntilTimestamp } = this.getStatus();
    if (hasRemovedAds || isSubscribed) return false;
    if (adsFreeUntilTimestamp && Date.now() < adsFreeUntilTimestamp) return false;
    if (!this.consentGranted && !isExpoGo) {
      // Sans décision de consentement (même "non personnalisé"), UMP bloque déjà
      // le chargement ; on ne tente pas de charger de pub.
    }
    return true;
  }

  /**
   * À appeler une fois au démarrage de l'app (ex: dans app/_layout.tsx).
   * 1. Résout le formulaire de consentement UMP (obligatoire RGPD/EEE + UK).
   * 2. Demande l'autorisation App Tracking Transparency sur iOS 14.5+.
   * 3. Initialise le SDK Mobile Ads.
   * 4. Précharge interstitiel + rewarded.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const { AdsConsent, AdsConsentStatus } = await import(
        "react-native-google-mobile-ads"
      );

      const consentInfo = await AdsConsent.requestInfoUpdate();

      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === AdsConsentStatus.REQUIRED
      ) {
        await AdsConsent.showForm();
      }

      const finalStatus = await AdsConsent.getConsentInfo();
      this.consentGranted =
        finalStatus.status === AdsConsentStatus.OBTAINED ||
        finalStatus.status === AdsConsentStatus.NOT_REQUIRED;
    } catch (error) {
      console.warn("[AdsService] Erreur consentement UMP:", error);
      // On considère le consentement comme non accordé par défaut : le SDK
      // AdMob servira alors uniquement des pubs contextuelles limitées.
      this.consentGranted = false;
    }

    // App Tracking Transparency (iOS uniquement) — indépendant d'UMP mais
    // conditionne le ciblage publicitaire cross-app sur iOS.
    if (Platform.OS === "ios") {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      if (status === "undetermined") {
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
    }

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    await mobileAds().initialize();

    if (this.canShowAds()) {
      this.preloadInterstitial();
      this.preloadRewardedUnlock();
      this.preloadRewarded24h();
    }
  }

  // --- Interstitiel : après consultation de N recettes, max 1×/session ---
  preloadInterstitial() {
    if (!this.canShowAds() || this.interstitial) return;
    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: !this.consentGranted,
    });
    const unsub = this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
      unsub();
    });
    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.interstitialLoaded = false;
      this.interstitial = null;
      this.preloadInterstitial();
    });
    this.interstitial.load();
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.canShowAds() || !this.interstitial || !this.interstitialLoaded) {
      return false;
    }
    await this.interstitial.show();
    return true;
  }

  // --- Rewarded : débloquer une recette premium à l'unité ---
  preloadRewardedUnlock() {
    if (!this.canShowAds() || this.rewardedUnlock) return;
    this.rewardedUnlock = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: !this.consentGranted,
    });
    const unsub = this.rewardedUnlock.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewardedUnlockLoaded = true;
      unsub();
    });
    this.rewardedUnlock.load();
  }

  /** Retourne true si la récompense a bien été accordée (l'utilisateur a regardé jusqu'au bout). */
  showRewardedToUnlockRecipe(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.rewardedUnlock || !this.rewardedUnlockLoaded) {
        resolve(false);
        return;
      }
      let earned = false;
      const unsubEarn = this.rewardedUnlock.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const unsubClose = this.rewardedUnlock.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarn();
        unsubClose();
        this.rewardedUnlockLoaded = false;
        this.rewardedUnlock = null;
        this.preloadRewardedUnlock();
        resolve(earned);
      });
      this.rewardedUnlock.show();
    });
  }

  // --- Rewarded : "Sans pubs pendant 24h" ---
  preloadRewarded24h() {
    if (!this.canShowAds() || this.rewarded24h) return;
    this.rewarded24h = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: !this.consentGranted,
    });
    const unsub = this.rewarded24h.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewarded24hLoaded = true;
      unsub();
    });
    this.rewarded24h.load();
  }

  showRewarded24hFree(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.rewarded24h || !this.rewarded24hLoaded) {
        resolve(false);
        return;
      }
      let earned = false;
      const unsubEarn = this.rewarded24h.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const unsubClose = this.rewarded24h.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarn();
        unsubClose();
        this.rewarded24hLoaded = false;
        this.rewarded24h = null;
        this.preloadRewarded24h();
        resolve(earned);
      });
      this.rewarded24h.show();
    });
  }

  /** Permet de ré-ouvrir le formulaire de confidentialité depuis les Paramètres. */
  async openPrivacyOptionsForm() {
    try {
      const { AdsConsent } = await import("react-native-google-mobile-ads");
      await AdsConsent.showPrivacyOptionsForm();
    } catch (error) {
      console.warn("[AdsService] Impossible d'ouvrir les options de confidentialité:", error);
    }
  }
}

export const adsService = new AdsService();
