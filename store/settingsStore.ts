import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  darkMode: boolean;
  language: "fr" | "en";
  notificationsEnabled: boolean;
  setDarkMode: (value: boolean) => void;
  setLanguage: (lang: "fr" | "en") => void;
  setNotificationsEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      language: "fr",
      notificationsEnabled: true,
      setDarkMode: (value) => set({ darkMode: value }),
      setLanguage: (lang) => set({ language: lang }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
