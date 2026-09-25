import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (recipeId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(recipeId)
            ? state.favoriteIds.filter((id) => id !== recipeId)
            : [...state.favoriteIds, recipeId],
        })),
      isFavorite: (recipeId) => get().favoriteIds.includes(recipeId),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
