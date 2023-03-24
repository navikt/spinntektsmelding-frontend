/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      provider: 'c8'
    },
    reporters: ['vitest-sonar-reporter', 'default'],
    outputFile: 'sonar-report.xml'
  }
});
