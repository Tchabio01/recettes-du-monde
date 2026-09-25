import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recipe, ShoppingListItem } from "@/types";

interface ShoppingListState {
  items: ShoppingListItem[];
  addRecipeIngredients: (recipe: Recipe) => void;
  toggleChecked: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set) => ({
      items: [],
      addRecipeIngredients: (recipe) =>
        set((state) => {
          const newItems: ShoppingListItem[] = recipe.ingredients.map((ing) => ({
            id: `${recipe.id}-${ing.id}`,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            checked: false,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
          }));
          const existingIds = new Set(state.items.map((i) => i.id));
          const merged = [...state.items, ...newItems.filter((i) => !existingIds.has(i.id))];
          return { items: merged };
        }),
      toggleChecked: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item,
          ),
        })),
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== itemId) })),
      clearChecked: () =>
        set((state) => ({ items: state.items.filter((item) => !item.checked) })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: "shopping-list-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
