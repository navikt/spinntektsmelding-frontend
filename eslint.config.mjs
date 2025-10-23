import { fixupConfigRules } from "@eslint/compat";
import pluginNext from "@next/eslint-plugin-next";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    {
        plugins: {
            react: fixupConfigRules(pluginReact),
            "react-hooks": fixupConfigRules(pluginReactHooks),
            "@next/next": pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs["core-web-vitals"].rules,
        },
    },
    globalIgnores(["**/build/**", "**/node_modules/**", "**/.next/**", "**/.yarn/**"]),
]);
