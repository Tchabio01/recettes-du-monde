import "../global.css";
import "@/lib/i18n";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ENV } from "@/constants/config";
import { adsService } from "@/services/adsService";
import { purchasesService } from "@/services/purchasesService";
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSettingsStore } from "@/store/settingsStore";
import "@/store/monetizationStore"; // branche adsService <-> monetizationStore

SplashScreen.preventAutoHideAsync().catch(() => {});

if (ENV.sentryDsn) {
  Sentry.init({
    dsn: ENV.sentryDsn,
    tracesSampleRate: 0.2,
    debug: __DEV__,
    enabled: !__DEV__,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function RootLayoutContent() {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    async function bootstrap() {
      try {
        await adsService.initialize();

        const {
          data: { session },
        } = await supabase.auth.getSession();
        await purchasesService.initialize(session?.user?.id);
      } catch (error) {
        console.warn("[Bootstrap] Erreur d'initialisation:", error);
        Sentry.captureException(error);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "(onboarding)";
    if (!onboardingCompleted && !inOnboarding) {
      router.replace("/(onboarding)/welcome");
    }
  }, [ready, onboardingCompleted, segments]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PostHogProvider
            apiKey={ENV.posthogApiKey}
            options={{ host: ENV.posthogHost, enable: !__DEV__ }}
          >
            <RootLayoutContent />
          </PostHogProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default ENV.sentryDsn ? Sentry.wrap(App) : App;
