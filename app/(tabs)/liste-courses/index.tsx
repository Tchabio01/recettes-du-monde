import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShoppingListStore } from "@/store/shoppingListStore";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdBanner } from "@/components/ads/AdBanner";
import { cn } from "@/lib/utils";

export default function ShoppingListScreen() {
  const { items, toggleChecked, removeItem, clearChecked } = useShoppingListStore();
  const hasChecked = items.some((i) => i.checked);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-4">
        <Text className="font-sans-bold text-2xl text-neutral-600">Liste de courses</Text>
        {hasChecked ? (
          <Pressable onPress={clearChecked}>
            <Text className="font-sans-medium text-sm text-primary-500">Effacer cochés</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 8 }}
        ListEmptyComponent={
          <EmptyState
            icon="🛒"
            title="Votre liste de courses est vide"
            description="Ajoutez les ingrédients d'une recette depuis sa page de détail"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleChecked(item.id)}
            onLongPress={() => removeItem(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            className="flex-row items-center justify-between rounded-xl bg-white p-3.5 shadow-sm shadow-black/5"
          >
            <View className="flex-row items-center gap-3">
              <View
                className={cn(
                  "h-6 w-6 items-center justify-center rounded-md border-2",
                  item.checked ? "border-secondary-500 bg-secondary-500" : "border-neutral-200",
                )}
              >
                {item.checked ? <Text className="text-xs text-white">✓</Text> : null}
              </View>
              <View>
                <Text
                  className={cn(
                    "font-sans-medium text-sm text-neutral-600",
                    item.checked && "text-neutral-400 line-through",
                  )}
                >
                  {item.name}
                </Text>
                {item.recipeTitle ? (
                  <Text className="font-sans text-xs text-neutral-400">{item.recipeTitle}</Text>
                ) : null}
              </View>
            </View>
            <Text className="font-sans text-xs text-neutral-400">
              {item.quantity} {item.unit}
            </Text>
          </Pressable>
        )}
      />
      <AdBanner />
    </SafeAreaView>
  );
}
