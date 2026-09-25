import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Diet } from "@/types";

interface OnboardingState {
  completed: boolean;
  selectedDiets: Diet[];
  toggleDiet: (diet: Diet) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      selectedDiets: ["classique"],
      toggleDiet: (diet) =>
        set((state) => ({
          selectedDiets: state.selectedDiets.includes(diet)
            ? state.selectedDiets.filter((d) => d !== diet)
            : [...state.selectedDiets, diet],
        })),
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false, selectedDiets: ["classique"] }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
