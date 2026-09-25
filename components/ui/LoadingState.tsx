import { View, ActivityIndicator, Text } from "react-native";

export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#FF7A00" />
      <Text className="mt-3 font-sans text-sm text-neutral-400">{label}</Text>
    </View>
  );
}
