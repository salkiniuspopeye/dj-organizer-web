import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import prettierConfig from "eslint-config-prettier";
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", ".pwa-assets", "**/*.js"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      ...prettierConfig.rules,
    },
  }
);