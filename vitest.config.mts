/// <reference types="vitest" />

import { defineConfig, configDefaults, ViteUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()] as ViteUserConfig['plugins'],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      './__tests__/setup.ts',
      '**/__mocks__/**.*',
      'tests/**',
      './__tests__/mock-dekoratoren-moduler.ts'
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
