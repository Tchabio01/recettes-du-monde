import { useState } from "react";
import { adsService } from "@/services/adsService";
import { Button } from "@/components/ui/Button";

interface RewardedButtonProps {
  label: string;
  kind: "unlockRecipe" | "adsFree24h";
  onRewardEarned: () => void;
}

/** Bouton générique déclenchant une pub récompensée (déblocage recette ou 24h sans pub). */
export function RewardedButton({ label, kind, onRewardEarned }: RewardedButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const earned =
        kind === "unlockRecipe"
          ? await adsService.showRewardedToUnlockRecipe()
          : await adsService.showRewarded24hFree();
      if (earned) onRewardEarned();
    } finally {
      setLoading(false);
    }
  };

  return <Button label={label} variant="secondary" loading={loading} onPress={handlePress} />;
}
