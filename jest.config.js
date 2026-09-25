module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)",
  ],
  setupFilesAfterEach: ["@testing-library/jest-native/extend-expect"],
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**", "!**/.expo/**"],
};
