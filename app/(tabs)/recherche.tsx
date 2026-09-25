import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { NativeAdCard } from "@/components/ads/NativeAdCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useRecipes } from "@/hooks/useRecipes";
import { recipesService } from "@/services/recipesService";
import { DIET_LABELS, DIFFICULTY_LABELS, MONETIZATION } from "@/constants/config";
import type { Diet, Difficulty } from "@/types";
import { cn } from "@/lib/utils";

const DIETS: Diet[] = ["classique", "vegetarien", "vegan", "sans_gluten", "sans_lactose"];
const DIFFICULTIES: Difficulty[] = ["facile", "moyen", "difficile"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedDiets, setSelectedDiets] = useState<Diet[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>([]);

  const { data: suggestions } = useQuery({
    queryKey: ["ingredient-autocomplete", query],
    queryFn: () => recipesService.autocompleteIngredients(query),
    enabled: query.length >= 2,
  });

  const filters = useMemo(
    () => ({
      query,
      diets: selectedDiets.length ? selectedDiets : undefined,
      difficulty: selectedDifficulty.length ? selectedDifficulty : undefined,
    }),
    [query, selectedDiets, selectedDifficulty],
  );

  const { data: recipes, isLoading, isError, refetch } = useRecipes(filters);

  const toggleDiet = (diet: Diet) =>
    setSelectedDiets((prev) => (prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]));

  const toggleDifficulty = (diff: Difficulty) =>
    setSelectedDifficulty((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff],
    );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 pt-4">
        <Text className="mb-3 font-sans-bold text-2xl text-neutral-600">Rechercher</Text>
        <Input
          placeholder="Rechercher par ingrédient..."
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Rechercher par ingrédient"
        />

        {suggestions && suggestions.length > 0 && query.length >= 2 ? (
          <View className="mb-3 -mt-2 rounded-xl bg-white p-2 shadow-sm shadow-black/5">
            {suggestions.slice(0, 5).map((s) => (
              <Pressable key={s} onPress={() => setQuery(s)} className="px-2 py-2">
                <Text className="font-sans text-sm text-neutral-600">{s}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DIFFICULTIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleDifficulty(item)}
              className={cn(
                "rounded-full border px-3.5 py-2",
                selectedDifficulty.includes(item)
                  ? "border-primary-500 bg-primary-500"
                  : "border-neutral-200 bg-white",
              )}
            >
              <Text
                className={cn(
                  "font-sans-medium text-xs",
                  selectedDifficulty.includes(item) ? "text-white" : "text-neutral-600",
                )}
              >
                {DIFFICULTY_LABELS[item]}
              </Text>
            </Pressable>
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DIETS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleDiet(item)}
              className={cn(
                "rounded-full border px-3.5 py-2",
                selectedDiets.includes(item)
                  ? "border-secondary-500 bg-secondary-500"
                  : "border-neutral-200 bg-white",
              )}
            >
              <Text
                className={cn(
                  "font-sans-medium text-xs",
                  selectedDiets.includes(item) ? "text-white" : "text-neutral-600",
                )}
              >
                {DIET_LABELS[item]}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={recipes ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
          ListEmptyComponent={<EmptyState title="Aucune recette trouvée" icon="🔍" />}
          renderItem={({ item, index }) => (
            <>
              <RecipeCard recipe={item} />
              {(index + 1) % MONETIZATION.nativeAdEveryNItems === 0 ? <NativeAdCard /> : null}
            </>
          )}
        />
      )}

      <AdBanner />
    </SafeAreaView>
  );
}
