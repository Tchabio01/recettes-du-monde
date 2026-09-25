import { View, Text, Switch, Pressable, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/settingsStore";
import { adsService } from "@/services/adsService";
import { notificationsService } from "@/services/notificationsService";
import { cn } from "@/lib/utils";

export default function SettingsScreen() {
  const { darkMode, language, notificationsEnabled, setDarkMode, setLanguage, setNotificationsEnabled } =
    useSettingsStore();

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await notificationsService.registerForPushNotifications();
      await notificationsService.scheduleDailyRecipeNotification();
    } else {
      await notificationsService.cancelDailyRecipeNotification();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Paramètres" }} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
          <Text className="font-sans-medium text-base text-neutral-600">Mode sombre</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: "#FF7A00" }} />
        </View>

        <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
          <Text className="font-sans-medium text-base text-neutral-600">
            Notification "Recette du jour"
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: "#FF7A00" }}
          />
        </View>

        <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
          <Text className="mb-3 font-sans-medium text-base text-neutral-600">Langue</Text>
          <View className="flex-row gap-2">
            {(["fr", "en"] as const).map((lang) => (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                className={cn(
                  "rounded-full border px-4 py-2",
                  language === lang ? "border-primary-500 bg-primary-500" : "border-neutral-200",
                )}
              >
                <Text
                  className={cn(
                    "font-sans-medium text-sm",
                    language === lang ? "text-white" : "text-neutral-600",
                  )}
                >
                  {lang === "fr" ? "Français" : "English"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => adsService.openPrivacyOptionsForm()}
          className="rounded-2xl bg-white p-4 shadow-sm shadow-black/5"
        >
          <Text className="font-sans-medium text-base text-neutral-600">
            🔐 Options de confidentialité publicitaire
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
