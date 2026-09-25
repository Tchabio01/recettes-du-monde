module.exports = {
  extends: ["expo", "prettier"],
  ignorePatterns: ["/dist/*"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
