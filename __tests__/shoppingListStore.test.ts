import { useShoppingListStore } from "@/store/shoppingListStore";
import type { Recipe } from "@/types";

const mockRecipe: Recipe = {
  id: "r1",
  title: "Pâtes carbonara",
  description: "",
  imageUrl: "",
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  difficulty: "facile",
  diets: ["classique"],
  ingredients: [{ id: "i1", name: "Pâtes", quantity: 200, unit: "g" }],
  steps: [],
  nutrition: { calories: 500, proteins: 20, carbs: 60, fats: 15 },
  isPremium: false,
  tags: [],
  rating: 4.5,
  createdAt: new Date().toISOString(),
};

describe("shoppingListStore", () => {
  beforeEach(() => {
    useShoppingListStore.setState({ items: [] });
  });

  it("adds recipe ingredients without duplicating them", () => {
    const { addRecipeIngredients } = useShoppingListStore.getState();
    addRecipeIngredients(mockRecipe);
    addRecipeIngredients(mockRecipe);
    expect(useShoppingListStore.getState().items).toHaveLength(1);
  });

  it("toggles an item as checked", () => {
    const { addRecipeIngredients, toggleChecked } = useShoppingListStore.getState();
    addRecipeIngredients(mockRecipe);
    const itemId = useShoppingListStore.getState().items[0].id;
    toggleChecked(itemId);
    expect(useShoppingListStore.getState().items[0].checked).toBe(true);
  });
});
