// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// ESLint v9+ flat config
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";

const compat = new FlatCompat();

export default [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:prettier/recommended"),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    ignores: [
      "node_modules",
      ".next",
      "out",
      "build",
      "coverage",
      "*.log",
      ".env",
      ".env.*",
      "!env.example",
      "scripts/task-complexity-report.json",
      "tasks/tasks.json",
    ],
  },
  ...storybook.configs["flat/recommended"],
];
