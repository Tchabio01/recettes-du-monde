import { useQuery } from "@tanstack/react-query";
import { recipesService } from "@/services/recipesService";
import type { RecipeFilters } from "@/types";

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: ["recipes", filters],
    queryFn: () => recipesService.listRecipes(filters),
  });
}

export function useRecipeOfTheDay() {
  return useQuery({
    queryKey: ["recipe-of-the-day"],
    queryFn: () => recipesService.getRecipeOfTheDay(),
  });
}

export function usePopularRecipes() {
  return useQuery({
    queryKey: ["popular-recipes"],
    queryFn: () => recipesService.getPopularRecipes(),
  });
}

export function useRecipeDetail(id: string) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => recipesService.getRecipeById(id),
    enabled: Boolean(id),
  });
}
