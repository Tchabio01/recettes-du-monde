import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNIT_IDS, adsService } from "@/services/adsService";

/** Bannière adaptative. Ne rend rien si l'utilisateur n'a pas de pub à voir. */
export function AdBanner() {
  if (!adsService.canShowAds()) return null;

  return (
    <View className="w-full items-center bg-transparent">
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
