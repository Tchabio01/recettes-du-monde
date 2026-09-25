import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { adsService } from "@/services/adsService";
import { STORAGE_KEYS, MONETIZATION } from "@/constants/config";

/**
 * Affiche un interstitiel après la consultation de N recettes, au maximum
 * une fois par session (le compteur de session vit en mémoire process, donc
 * il repart à zéro à chaque redémarrage de l'app = "par session").
 */
let sessionViews = 0;
let interstitialShownThisSession = false;

export function useInterstitialOnRecipeView() {
  return useCallback(async () => {
    sessionViews += 1;
    if (
      sessionViews >= MONETIZATION.interstitialAfterNRecipes &&
      !interstitialShownThisSession
    ) {
      const shown = await adsService.showInterstitial();
      if (shown) interstitialShownThisSession = true;
    }
  }, []);
}
