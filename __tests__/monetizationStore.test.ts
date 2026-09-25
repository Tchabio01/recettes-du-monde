import { useMonetizationStore } from "@/store/monetizationStore";

describe("monetizationStore", () => {
  beforeEach(() => {
    useMonetizationStore.setState({
      hasRemovedAds: false,
      isSubscribed: false,
      adsFreeUntilTimestamp: null,
      unlockedPremiumRecipeIds: [],
    });
  });

  it("unlocks a premium recipe and remembers it", () => {
    const { unlockPremiumRecipe, isPremiumRecipeUnlocked } = useMonetizationStore.getState();
    expect(isPremiumRecipeUnlocked("recipe-1")).toBe(false);
    unlockPremiumRecipe("recipe-1");
    expect(useMonetizationStore.getState().isPremiumRecipeUnlocked("recipe-1")).toBe(true);
  });

  it("grants 24h ads-free window in the future", () => {
    useMonetizationStore.getState().grant24hAdsFree();
    const until = useMonetizationStore.getState().adsFreeUntilTimestamp;
    expect(until).not.toBeNull();
    expect(until!).toBeGreaterThan(Date.now());
  });
});
