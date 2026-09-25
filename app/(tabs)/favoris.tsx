import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipes } from "@/hooks/useRecipes";
import { useFavoritesStore } from "@/store/favoritesStore";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { AdBanner } from "@/components/ads/AdBanner";

export default function FavoritesScreen() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const { data: allRecipes, isLoading } = useRecipes();
  const favorites = (allRecipes ?? []).filter((r) => favoriteIds.includes(r.id));

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 pt-4">
        <Text className="mb-3 font-sans-bold text-2xl text-neutral-600">Mes favoris</Text>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
          ListEmptyComponent={
            <EmptyState icon="❤️" title="Aucun favori pour le moment" description="Ajoutez des recettes en appuyant sur le cœur" />
          }
          renderItem={({ item }) => <RecipeCard recipe={item} />}
        />
      )}
      <AdBanner />
    </SafeAreaView>
  );
}
