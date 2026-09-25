import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationsService {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn("[Notifications] Les notifications push nécessitent un appareil physique.");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF7A00",
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  /** Planifie une notification locale quotidienne "Recette du jour" à 12h00. */
  async scheduleDailyRecipeNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍽️ Votre recette du jour",
        body: "Découvrez une nouvelle idée de recette prête en quelques minutes !",
        data: { type: "daily_recipe" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 12,
        minute: 0,
        repeats: true,
      },
    });
  }

  async cancelDailyRecipeNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationsService = new NotificationsService();
