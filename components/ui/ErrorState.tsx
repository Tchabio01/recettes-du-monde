import { View, Text } from "react-native";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Une erreur est survenue", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="mb-3 text-5xl">⚠️</Text>
      <Text className="mb-4 text-center font-sans-medium text-base text-neutral-600">{message}</Text>
      {onRetry ? <Button label="Réessayer" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}
