import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
    ...nextVitals,
    globalIgnores(["**/build/**", "**/node_modules/**", "**/.next/**", "**/.yarn/**", "**/playwright-report/**", "**/coverage/**"]),
]);
