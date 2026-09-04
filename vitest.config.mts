/// <reference types="vitest" />

import { defineConfig, configDefaults, ViteUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as ViteUserConfig['plugins'],
  resolve: {
    tsconfigPaths: true
  },
  cacheDir: 'node_modules/.cache/vite',
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      './__tests__/setup.ts',
      '**/__mocks__/**.*',
      'tests/**',
      './__tests__/mock-dekoratoren-moduler.ts',
      'playwright-report/**',
      'playwright.config.ts'
    ],
    setupFiles: ['./__tests__/setup.ts', './__tests__/mock-dekoratoren-moduler.ts'],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      provider: 'v8'
    },
    reporters: ['vitest-sonar-reporter', 'default'],
    outputFile: 'sonar-report.xml',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    }
  }
});
