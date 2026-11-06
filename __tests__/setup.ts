import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// import '@testing-library/jest-dom/extend-expect';
import { toHaveNoViolations } from 'jest-axe';

declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toHaveNoViolations(): R;
  }
}

vi.mock('next/router', () => require('next-router-mock'));

vi.mock('zustand');

// Extend the functionality to support axe
expect.extend(toHaveNoViolations);
