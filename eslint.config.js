import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const nonDeterminism = [
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: "Do not call Date.now(); inject a Clock (src/clock.ts).",
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: "Do not call new Date() without arguments; inject a Clock (src/clock.ts).",
  },
  {
    selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message: "Do not call Math.random(); inject a Clock (src/clock.ts).",
  },
];

export default tseslint.config(
  { ignores: ["dist", "node_modules", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-syntax": ["error", ...nonDeterminism],
    },
  },
  {
    files: ["*.config.{js,ts}", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
);
