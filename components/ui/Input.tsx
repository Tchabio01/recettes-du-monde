import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label ? <Text className="mb-1.5 font-sans-medium text-sm text-neutral-600">{label}</Text> : null}
      <TextInput
        className={cn(
          "rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base text-neutral-600",
          error && "border-red-400",
          className as string,
        )}
        placeholderTextColor="#9C9A93"
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
