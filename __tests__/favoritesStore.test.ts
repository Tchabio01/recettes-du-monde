import { useFavoritesStore } from "@/store/favoritesStore";

describe("favoritesStore", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  it("toggles a recipe in and out of favorites", () => {
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite("recipe-1");
    expect(useFavoritesStore.getState().isFavorite("recipe-1")).toBe(true);
    toggleFavorite("recipe-1");
    expect(useFavoritesStore.getState().isFavorite("recipe-1")).toBe(false);
  });
});
