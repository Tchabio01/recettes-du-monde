import { View, Text } from "react-native";
import { adsService } from "@/services/adsService";

/**
 * Emplacement natif inséré toutes les 5 recettes dans les listes.
 * NB: react-native-google-mobile-ads ne fournit pas de composant Native Ad
 * "clé en main" au moment de la rédaction — cette carte affiche le
 * placeholder structurel (image/titre/CTA) à connecter à `NativeAd.createForAdRequest`
 * une fois le module natif natif configuré, sans casser le rendu de la liste.
 */
export function NativeAdCard() {
  if (!adsService.canShowAds()) return null;

  return (
    <View className="mb-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
      <Text className="mb-1 text-xs font-sans-medium uppercase text-neutral-400">Publicité</Text>
      <Text className="font-sans text-sm text-neutral-400">Emplacement annonce native</Text>
    </View>
  );
}
