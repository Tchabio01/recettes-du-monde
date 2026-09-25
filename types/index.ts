export type Diet =
  | "classique"
  | "vegetarien"
  | "vegan"
  | "sans_gluten"
  | "sans_lactose";

export type Difficulty = "facile" | "moyen" | "difficile";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface RecipeStep {
  order: number;
  instruction: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  diets: Diet[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
  isPremium: boolean;
  tags: string[];
  rating: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  diets: Diet[];
  darkMode: boolean;
  language: "fr" | "en";
  isSubscribed: boolean;
  hasRemovedAds: boolean;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  recipeId?: string;
  recipeTitle?: string;
}

export interface RecipeFilters {
  query?: string;
  ingredients?: string[];
  maxPrepTime?: number;
  difficulty?: Difficulty[];
  diets?: Diet[];
  maxCalories?: number;
}

export type SubscriptionStatus = "free" | "ads_removed" | "premium";
