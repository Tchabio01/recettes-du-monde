import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-2xl bg-white p-4 shadow-sm shadow-black/5", className as string)}
      {...props}
    />
  );
}
