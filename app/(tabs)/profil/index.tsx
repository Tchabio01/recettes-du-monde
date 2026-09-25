import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { purchasesService } from "@/services/purchasesService";
import { useMonetizationStore } from "@/store/monetizationStore";
import { MONETIZATION } from "@/constants/config";

export default function ProfileScreen() {
  const router = useRouter();
  const [purchaseLoading, setPurchaseLoading] = useState<"ads" | "premium" | null>(null);
  const { hasRemovedAds, isSubscribed, setRemovedAds, setSubscribed } = useMonetizationStore();

  const handleRemoveAds = async () => {
    setPurchaseLoading("ads");
    try {
      const info = await purchasesService.purchaseRemoveAds();
      if (info) setRemovedAds(true);
    } catch (error) {
      console.warn("[Profile] Achat Remove Ads échoué:", error);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleSubscribePremium = async () => {
    setPurchaseLoading("premium");
    try {
      const info = await purchasesService.purchasePremium();
      if (info) setSubscribed(true);
    } catch (error) {
      console.warn("[Profile] Abonnement Premium échoué:", error);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            // La suppression effective doit passer par une Edge Function Supabase
            // (service_role requis) — voir supabase/functions/delete-account.
            const { error } = await supabase.functions.invoke("delete-account");
            if (!error) {
              await supabase.auth.signOut();
              router.replace("/(auth)/login");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-5 font-sans-bold text-2xl text-neutral-600">Profil</Text>

        {!isSubscribed ? (
          <Card className="mb-4 border border-primary-100 bg-primary-50">
            <Text className="mb-1 font-sans-semibold text-base text-neutral-600">
              Passer Premium
            </Text>
            <Text className="mb-3 font-sans text-sm text-neutral-400">
              Recettes premium en illimité et zéro publicité, pour{" "}
              {MONETIZATION.premiumMonthlyPriceLabel}.
            </Text>
            <Button
              label="S'abonner"
              loading={purchaseLoading === "premium"}
              onPress={handleSubscribePremium}
            />
          </Card>
        ) : (
          <Card className="mb-4 border border-secondary-100 bg-secondary-50">
            <Text className="font-sans-semibold text-base text-secondary-700">
              ✓ Abonnement Premium actif
            </Text>
          </Card>
        )}

        {!hasRemovedAds && !isSubscribed ? (
          <Card className="mb-4">
            <Text className="mb-1 font-sans-semibold text-base text-neutral-600">
              Supprimer les publicités
            </Text>
            <Text className="mb-3 font-sans text-sm text-neutral-400">
              Achat unique de {MONETIZATION.removeAdsPriceLabel}, à vie.
            </Text>
            <Button
              label="Acheter"
              variant="outline"
              loading={purchaseLoading === "ads"}
              onPress={handleRemoveAds}
            />
          </Card>
        ) : null}

        <Pressable
          onPress={() => router.push("/(tabs)/profil/parametres")}
          className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm shadow-black/5"
        >
          <Text className="font-sans-medium text-base text-neutral-600">⚙️ Paramètres</Text>
          <Text className="text-neutral-400">›</Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          className="mb-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5"
        >
          <Text className="font-sans-medium text-base text-neutral-600">🚪 Se déconnecter</Text>
        </Pressable>

        <Pressable onPress={handleDeleteAccount} className="rounded-2xl bg-white p-4">
          <Text className="font-sans-medium text-base text-red-500">
            🗑️ Supprimer mon compte
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
