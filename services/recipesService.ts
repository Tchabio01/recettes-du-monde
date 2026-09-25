import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/constants/config";
import type { Recipe, RecipeFilters } from "@/types";

/**
 * Couche d'accès aux recettes avec support hors-ligne : toute recette
 * consultée est mise en cache localement, et en l'absence de réseau on sert
 * le cache plutôt qu'une erreur.
 */
class RecipesService {
  private async getCache(): Promise<Record<string, Recipe>> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.cachedRecipes);
    return raw ? JSON.parse(raw) : {};
  }

  private async setCache(cache: Record<string, Recipe>) {
    await AsyncStorage.setItem(STORAGE_KEYS.cachedRecipes, JSON.stringify(cache));
  }

  private async cacheRecipe(recipe: Recipe) {
    const cache = await this.getCache();
    cache[recipe.id] = recipe;
    await this.setCache(cache);
  }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  }

  async listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
    const online = await this.isOnline();

    if (!online) {
      const cache = await this.getCache();
      return Object.values(cache);
    }

    let query = supabase.from("recipes").select("*").order("created_at", { ascending: false });

    if (filters.query) {
      query = query.ilike("title", `%${filters.query}%`);
    }
    if (filters.maxPrepTime) {
      query = query.lte("prep_time_minutes", filters.maxPrepTime);
    }
    if (filters.difficulty?.length) {
      query = query.in("difficulty", filters.difficulty);
    }
    if (filters.diets?.length) {
      query = query.contains("diets", filters.diets);
    }
    if (filters.maxCalories) {
      query = query.lte("nutrition->calories", filters.maxCalories);
    }
    if (filters.ingredients?.length) {
      query = query.contains("ingredient_names", filters.ingredients);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Recipe[];
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const online = await this.isOnline();

    if (online) {
      const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (!error && data) {
        const recipe = data as Recipe;
        await this.cacheRecipe(recipe);
        return recipe;
      }
    }

    const cache = await this.getCache();
    return cache[id] ?? null;
  }

  async getRecipeOfTheDay(): Promise<Recipe | null> {
    const online = await this.isOnline();
    if (!online) {
      const cache = await this.getCache();
      const values = Object.values(cache);
      return values[0] ?? null;
    }
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_recipe_of_the_day", true)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as Recipe;
  }

  async getPopularRecipes(limit = 10): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("rating", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Recipe[];
  }

  async autocompleteIngredients(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    const { data, error } = await supabase.rpc("autocomplete_ingredients", {
      search_term: query,
    });
    if (error) return [];
    return (data ?? []) as string[];
  }
}

export const recipesService = new RecipesService();
