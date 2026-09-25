/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF3E6",
          100: "#FFE0BF",
          300: "#FFB366",
          500: "#FF7A00",
          600: "#E56E00",
          700: "#B85700",
        },
        secondary: {
          50: "#EEF7EE",
          100: "#D4EBD4",
          300: "#8FCB8F",
          500: "#3F9142",
          600: "#347B37",
          700: "#285C2A",
        },
        neutral: {
          50: "#FAFAF8",
          100: "#F2F1EE",
          200: "#E4E2DD",
          400: "#9C9A93",
          600: "#5B594F"
        }
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
