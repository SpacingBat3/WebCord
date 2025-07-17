// @ts-check
import js  from "@eslint/js";
import ts  from "typescript-eslint";
import ix  from "eslint-plugin-import-x";
import pth from "node:path";

export default ts.config(
  // Parsing configuration
  {
    settings: {
      resolver: "typescript",
      "import-x/core-modules": [
        // Electron APIs
        "electron/common","electron/renderer","electron/main",
        // Node.js FS API, without treating ASAR as directories
        "original-fs","node:original-fs"
      ]
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: pth.resolve(import.meta.dirname,"..")
      },
    }
  },
  // Global rules
  {
    files: ["sources/**/*.{ts,mts,cts}"],
    ignores: ["**/*.d.ts"],
    extends: [
      js.configs.recommended,
      ix.flatConfigs.recommended,
      ix.flatConfigs.typescript,
      ts.configs.strictTypeChecked,
    ],
    rules: {
      /*** ESLint built-in rules ***/
      "no-restricted-imports": ["error", {
        name: "electron",
        message: [
          "Please use 'electron/common', 'electron/main' or 'electron/renderer'",
          "to express the intended script process type and limit availability of",
          "Electron API."
        ].join(" ")
      }],
      /*** Typescript ESLint rules ***/
      "@typescript-eslint/no-confusing-void-expression": ["error", {
        ignoreArrowShorthand: true
      }],
      /*** Import plugin rules ***/
      "import-x/no-unused-modules": ["error", {
        unusedExports: true
      }]
    }
  }
);