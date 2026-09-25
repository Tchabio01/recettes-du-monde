import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipeOfTheDay, usePopularRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HomeScreen() {
  const router = useRouter();
  const recipeOfDay = useRecipeOfTheDay();
  const popular = usePopularRecipes();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
        <View className="px-5 pt-4">
          <Text className="font-sans-bold text-2xl text-neutral-600">
            Recettes du Monde 🍲
          </Text>
          <Text className="mt-1 font-sans text-sm text-neutral-400">
            Qu'est-ce qu'on cuisine aujourd'hui ?
          </Text>
        </View>

        <View className="mt-5 px-5">
          <Text className="mb-3 font-sans-semibold text-lg text-neutral-600">
            Recette du jour
          </Text>
          {recipeOfDay.isLoading ? (
            <LoadingState />
          ) : recipeOfDay.isError ? (
            <ErrorState onRetry={() => recipeOfDay.refetch()} />
          ) : recipeOfDay.data ? (
            <Pressable
              onPress={() => router.push(`/(tabs)/recette/${recipeOfDay.data!.id}`)}
              className="overflow-hidden rounded-3xl bg-white shadow-sm shadow-black/5"
            >
              <Image
                source={{ uri: recipeOfDay.data.imageUrl }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
              <View className="p-4">
                <Text className="font-sans-semibold text-lg text-neutral-600">
                  {recipeOfDay.data.title}
                </Text>
                <Text numberOfLines={2} className="mt-1 font-sans text-sm text-neutral-400">
                  {recipeOfDay.data.description}
                </Text>
              </View>
            </Pressable>
          ) : (
            <EmptyState title="Pas de recette du jour" description="Revenez plus tard !" />
          )}
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-3 font-sans-semibold text-lg text-neutral-600">
            Recettes populaires
          </Text>
          {popular.isLoading ? (
            <LoadingState />
          ) : popular.isError ? (
            <ErrorState onRetry={() => popular.refetch()} />
          ) : popular.data && popular.data.length > 0 ? (
            popular.data.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
          ) : (
            <EmptyState title="Aucune recette pour le moment" />
          )}
        </View>
      </ScrollView>

      <AdBanner />
    </SafeAreaView>
  );
}
