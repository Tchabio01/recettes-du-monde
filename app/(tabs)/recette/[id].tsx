import { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipeDetail } from "@/hooks/useRecipes";
import { useInterstitialOnRecipeView } from "@/hooks/useInterstitialOnViews";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useMonetizationStore } from "@/store/monetizationStore";
import { useShoppingListStore } from "@/store/shoppingListStore";
import { RewardedButton } from "@/components/ads/RewardedButton";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DIFFICULTY_LABELS, MONETIZATION } from "@/constants/config";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading, isError, refetch } = useRecipeDetail(id);
  const maybeShowInterstitial = useInterstitialOnRecipeView();

  const isFavorite = useFavoritesStore((s) => (recipe ? s.isFavorite(recipe.id) : false));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const addRecipeIngredients = useShoppingListStore((s) => s.addRecipeIngredients);

  const isUnlocked = useMonetizationStore(
    (s) => !recipe?.isPremium || s.isSubscribed || (recipe ? s.isPremiumRecipeUnlocked(recipe.id) : false),
  );
  const unlockPremiumRecipe = useMonetizationStore((s) => s.unlockPremiumRecipe);

  useEffect(() => {
    if (recipe) maybeShowInterstitial();
  }, [recipe?.id]);

  if (isLoading) return <LoadingState />;
  if (isError || !recipe) return <ErrorState onRetry={() => refetch()} />;

  if (recipe.isPremium && !isUnlocked) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50 px-8">
        <Stack.Screen options={{ headerShown: true, title: recipe.title }} />
        <Text className="mb-3 text-5xl">🔒</Text>
        <Text className="mb-2 text-center font-sans-semibold text-xl text-neutral-600">
          Recette premium
        </Text>
        <Text className="mb-6 text-center font-sans text-sm text-neutral-400">
          Regardez une courte publicité pour débloquer cette recette, ou passez Premium pour un
          accès illimité sans pub.
        </Text>
        <View className="w-full gap-3">
          <RewardedButton
            label="Débloquer avec une pub"
            kind="unlockRecipe"
            onRewardEarned={() => unlockPremiumRecipe(recipe.id)}
          />
          <Button
            label={`Passer Premium — ${MONETIZATION.premiumMonthlyPriceLabel}`}
            variant="primary"
            onPress={() => router.push("/(tabs)/profil")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: "" }} />
      <ScrollView>
        <Image source={{ uri: recipe.imageUrl }} style={{ width: "100%", height: 260 }} contentFit="cover" />

        <View className="px-5 pt-4">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 font-sans-bold text-2xl text-neutral-600">{recipe.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              onPress={() => toggleFavorite(recipe.id)}
              hitSlop={8}
              className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shadow-black/5"
            >
              <Text className="text-lg">{isFavorite ? "❤️" : "🤍"}</Text>
            </Pressable>
          </View>
          <Text className="mt-1 font-sans text-sm text-neutral-400">{recipe.description}</Text>

          <View className="mt-3 flex-row gap-4">
            <Text className="font-sans text-sm text-neutral-600">
              ⏱ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
            </Text>
            <Text className="font-sans text-sm text-neutral-600">
              📊 {DIFFICULTY_LABELS[recipe.difficulty]}
            </Text>
            <Text className="font-sans text-sm text-neutral-600">
              🔥 {recipe.nutrition.calories} kcal
            </Text>
          </View>

          <View className="mt-5">
            <Button
              label="Ajouter à la liste de courses"
              variant="secondary"
              onPress={() => addRecipeIngredients(recipe)}
            />
          </View>

          <Text className="mb-2 mt-6 font-sans-semibold text-lg text-neutral-600">Ingrédients</Text>
          {recipe.ingredients.map((ing) => (
            <View key={ing.id} className="flex-row items-center justify-between border-b border-neutral-100 py-2">
              <Text className="font-sans text-sm text-neutral-600">{ing.name}</Text>
              <Text className="font-sans text-sm text-neutral-400">
                {ing.quantity} {ing.unit}
              </Text>
            </View>
          ))}

          <Text className="mb-2 mt-6 font-sans-semibold text-lg text-neutral-600">Étapes</Text>
          {recipe.steps.map((step) => (
            <View key={step.order} className="mb-4 flex-row gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-500">
                <Text className="font-sans-semibold text-xs text-white">{step.order}</Text>
              </View>
              <Text className="flex-1 font-sans text-sm text-neutral-600">{step.instruction}</Text>
            </View>
          ))}

          <Text className="mb-2 mt-4 font-sans-semibold text-lg text-neutral-600">
            Valeurs nutritionnelles
          </Text>
          <View className="mb-8 flex-row flex-wrap gap-3">
            {[
              ["Calories", `${recipe.nutrition.calories} kcal`],
              ["Protéines", `${recipe.nutrition.proteins} g`],
              ["Glucides", `${recipe.nutrition.carbs} g`],
              ["Lipides", `${recipe.nutrition.fats} g`],
            ].map(([label, value]) => (
              <View key={label} className="w-[47%] rounded-xl bg-white p-3 shadow-sm shadow-black/5">
                <Text className="font-sans text-xs text-neutral-400">{label}</Text>
                <Text className="font-sans-semibold text-base text-neutral-600">{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
