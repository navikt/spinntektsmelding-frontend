import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';
import type { StateCreator } from 'zustand';

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

vi.mock('zustand/traditional', async (importOriginal) => {
  const actual = await importOriginal<typeof import('zustand/traditional')>();
  const { storeResetFns } = await import('../__mocks__/zustand');

  const createUncurried = <T>(
    stateCreator: StateCreator<T>,
    equalityFn?: <Value>(previous: Value, next: Value) => boolean
  ) => {
    const store = actual.createWithEqualityFn(stateCreator, equalityFn);
    const initialState = store.getInitialState();
    storeResetFns.add(() => store.setState(initialState, true));
    return store;
  };

  return {
    ...actual,
    createWithEqualityFn: <T>(
      stateCreator?: StateCreator<T>,
      equalityFn?: <Value>(previous: Value, next: Value) => boolean
    ) => (typeof stateCreator === 'function' ? createUncurried(stateCreator, equalityFn) : createUncurried)
  };
});

// Extend the functionality to support axe
expect.extend(toHaveNoViolations);
