import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("E-mail invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-8 text-center font-sans-bold text-2xl text-neutral-600">
          Bon retour parmi nous 👋
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Mot de passe"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        {authError ? <Text className="mb-4 text-center text-sm text-red-500">{authError}</Text> : null}

        <Button label="Se connecter" loading={loading} onPress={handleSubmit(onSubmit)} />

        <View className="mt-4 flex-row justify-center gap-1">
          <Text className="font-sans text-sm text-neutral-400">Pas encore de compte ?</Text>
          <Link href="/(auth)/signup" className="font-sans-semibold text-sm text-primary-500">
            S'inscrire
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
