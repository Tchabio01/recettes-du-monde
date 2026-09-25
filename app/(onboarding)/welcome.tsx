import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-2 text-6xl">🍲</Text>
        <Text className="mb-3 text-center font-sans-bold text-3xl text-white">
          Recettes du Monde
        </Text>
        <Text className="text-center font-sans text-base text-primary-50">
          Des recettes rapides et faciles pour tous les jours, où que vous soyez dans le monde.
        </Text>
      </View>
      <View className="px-8 pb-8">
        <Button
          label="Commencer"
          variant="outline"
          className="bg-white"
          onPress={() => router.push("/(onboarding)/diets")}
        />
      </View>
    </SafeAreaView>
  );
}
