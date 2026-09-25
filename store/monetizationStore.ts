import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { adsService } from "@/services/adsService";

interface MonetizationState {
  hasRemovedAds: boolean;
  isSubscribed: boolean;
  adsFreeUntilTimestamp: number | null;
  unlockedPremiumRecipeIds: string[];
  setRemovedAds: (value: boolean) => void;
  setSubscribed: (value: boolean) => void;
  grant24hAdsFree: () => void;
  unlockPremiumRecipe: (recipeId: string) => void;
  isPremiumRecipeUnlocked: (recipeId: string) => boolean;
}

export const useMonetizationStore = create<MonetizationState>()(
  persist(
    (set, get) => ({
      hasRemovedAds: false,
      isSubscribed: false,
      adsFreeUntilTimestamp: null,
      unlockedPremiumRecipeIds: [],
      setRemovedAds: (value) => set({ hasRemovedAds: value }),
      setSubscribed: (value) => set({ isSubscribed: value }),
      grant24hAdsFree: () =>
        set({ adsFreeUntilTimestamp: Date.now() + 24 * 60 * 60 * 1000 }),
      unlockPremiumRecipe: (recipeId) =>
        set((state) => ({
          unlockedPremiumRecipeIds: Array.from(
            new Set([...state.unlockedPremiumRecipeIds, recipeId]),
          ),
        })),
      isPremiumRecipeUnlocked: (recipeId) =>
        get().unlockedPremiumRecipeIds.includes(recipeId),
    }),
    {
      name: "monetization-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Branche le service AdMob sur ce store : canShowAds() lit toujours l'état à jour.
useMonetizationStore.subscribe((state) => {
  adsService.registerStatusGetter(() => ({
    hasRemovedAds: state.hasRemovedAds,
    isSubscribed: state.isSubscribed,
    adsFreeUntilTimestamp: state.adsFreeUntilTimestamp,
  }));
});
