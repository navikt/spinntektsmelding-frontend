import type { Mock } from 'vitest';

// Test-only export provided by vi.mock('next/navigation', ...) in page tests.
declare module 'next/navigation' {
  export const __mockedRouter: {
    push: Mock;
    replace: Mock;
    prefetch: Mock;
  };
}
