import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("flex-row items-center justify-center rounded-2xl px-5 py-3.5", {
  variants: {
    variant: {
      primary: "bg-primary-500 active:bg-primary-600",
      secondary: "bg-secondary-500 active:bg-secondary-600",
      outline: "border border-neutral-200 bg-transparent active:bg-neutral-50",
      ghost: "bg-transparent active:bg-neutral-100",
    },
    size: {
      sm: "px-3 py-2",
      md: "px-5 py-3.5",
      lg: "px-6 py-4",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

const textVariants = cva("font-sans-semibold text-center", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-white",
      outline: "text-neutral-600",
      ghost: "text-primary-500",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  label: string;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ label, variant, size, loading, disabled, className, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), (disabled || loading) && "opacity-50", className as string)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#FF7A00" : "#fff"} />
      ) : (
        <Text className={textVariants({ variant, size })}>{label}</Text>
      )}
    </Pressable>
  );
}
