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
      reporter: ['text', 'json', 'html']
    },
    reporters: 'vitest-sonar-reporter',
    outputFile: 'sonar-report.xml'
  }
});
