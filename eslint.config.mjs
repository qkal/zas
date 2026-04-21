import nextPlugin from "@next/eslint-plugin-next"
import tseslint from "typescript-eslint"

const config = tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
)

export default config
