import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useMonetizationStore } from "@/store/monetizationStore";
import { DIFFICULTY_LABELS } from "@/constants/config";
import type { Recipe } from "@/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(recipe.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isUnlocked = useMonetizationStore(
    (s) => !recipe.isPremium || s.isSubscribed || s.isPremiumRecipeUnlocked(recipe.id),
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/recette/${recipe.id}`)}
      className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm shadow-black/5"
    >
      <View className="relative">
        <Image
          source={{ uri: recipe.imageUrl }}
          style={{ width: "100%", height: 160 }}
          contentFit="cover"
          transition={200}
        />
        {recipe.isPremium && !isUnlocked ? (
          <View className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1">
            <Text className="font-sans-semibold text-xs text-white">🔒 Premium</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          onPress={() => toggleFavorite(recipe.id)}
          hitSlop={8}
          className="absolute left-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90"
        >
          <Text>{isFavorite ? "❤️" : "🤍"}</Text>
        </Pressable>
      </View>

      <View className="p-3">
        <Text numberOfLines={1} className="font-sans-semibold text-base text-neutral-600">
          {recipe.title}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-3">
          <Text className="font-sans text-xs text-neutral-400">
            ⏱ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
          </Text>
          <Text className="font-sans text-xs text-neutral-400">
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </Text>
          <Text className="font-sans text-xs text-neutral-400">⭐ {recipe.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
