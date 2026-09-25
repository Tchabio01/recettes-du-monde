import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useOnboardingStore } from "@/store/onboardingStore";
import { DIET_LABELS } from "@/constants/config";
import type { Diet } from "@/types";
import { cn } from "@/lib/utils";

const DIETS: Diet[] = ["classique", "vegetarien", "vegan", "sans_gluten", "sans_lactose"];

export default function DietsScreen() {
  const router = useRouter();
  const { selectedDiets, toggleDiet, complete } = useOnboardingStore();

  const handleContinue = () => {
    complete();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 px-6">
      <Text className="mb-2 mt-6 font-sans-bold text-2xl text-neutral-600">
        Vos préférences alimentaires
      </Text>
      <Text className="mb-6 font-sans text-base text-neutral-400">
        Vous pourrez les modifier plus tard dans votre profil.
      </Text>

      <FlatList
        data={DIETS}
        keyExtractor={(item) => item}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const selected = selectedDiets.includes(item);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => toggleDiet(item)}
              className={cn(
                "flex-row items-center justify-between rounded-2xl border-2 bg-white px-4 py-4",
                selected ? "border-primary-500" : "border-neutral-200",
              )}
            >
              <Text className="font-sans-medium text-base text-neutral-600">
                {DIET_LABELS[item]}
              </Text>
              <View
                className={cn(
                  "h-6 w-6 items-center justify-center rounded-full border-2",
                  selected ? "border-primary-500 bg-primary-500" : "border-neutral-200",
                )}
              >
                {selected ? <Text className="text-xs text-white">✓</Text> : null}
              </View>
            </Pressable>
          );
        }}
      />

      <View className="pb-6 pt-4">
        <Button label="Continuer" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
