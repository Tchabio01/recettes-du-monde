import { View, Text } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "🍽️", title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="mb-3 text-5xl">{icon}</Text>
      <Text className="mb-1 text-center font-sans-semibold text-lg text-neutral-600">{title}</Text>
      {description ? (
        <Text className="text-center font-sans text-sm text-neutral-400">{description}</Text>
      ) : null}
    </View>
  );
}
