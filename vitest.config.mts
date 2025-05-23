/// <reference types="vitest" />

import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, './__tests__/setup.ts', '**/__mocks__/**.*', 'tests/**'],
    setupFiles: './__tests__/setup.ts',
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
