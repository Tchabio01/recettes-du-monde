import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import fr from "./fr.json";
import en from "./en.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: Localization.getLocales()[0]?.languageCode === "en" ? "en" : "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
