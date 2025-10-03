import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { isBefore } from 'date-fns';
import useRefusjonEndringerUtenSkjaeringstidspunkt from '../../utils/useRefusjonEndringerUtenSkjaeringstidspunkt';

// Shared mutable mock state
let mockState: {
  refusjonEndringer?: { beloep?: number; dato?: Date }[];
  gammeltSkjaeringstidspunkt?: Date | undefined;
};

// Mock the store hook used inside the SUT
vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: (selector: any) => selector(mockState)
}));

// Mock the type-only import (runtime noop)
vi.mock('../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring', () => ({
  __esModule: true
}));

describe('useRefusjonEndringerUtenSkjaeringstidspunkt', () => {
  beforeEach(() => {
    mockState = {
      refusjonEndringer: undefined,
      gammeltSkjaeringstidspunkt: undefined
    };
  });

  it('returns undefined when no refusjonEndringer exist', () => {
    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toBeUndefined();
  });

  it('returns original array reference when gammeltSkjaeringstidspunkt is undefined', () => {
    const arr = [{ beloep: 100, dato: new Date('2024-01-01') }, { beloep: 200 }];
    mockState.refusjonEndringer = arr;

    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toBe(arr);
    expect(result.current).toEqual(arr);
  });

  it('filters out entries strictly before gammeltSkjaeringstidspunkt', () => {
    const skjæring = new Date('2024-05-10');
    const before = new Date('2024-05-09');
    const same = new Date('2024-05-10');
    const after = new Date('2024-05-11');

    mockState.gammeltSkjaeringstidspunkt = skjæring;
    mockState.refusjonEndringer = [
      { beloep: 10, dato: before }, // should be removed
      { beloep: 20, dato: same }, // kept
      { beloep: 30, dato: after }, // kept
      { beloep: 40 } // removed because no date when filtering
    ];

    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toEqual([
      { beloep: 20, dato: same },
      { beloep: 30, dato: after }
    ]);

    // Ensure isBefore logic matches expectation
    expect(isBefore(before, skjæring)).toBe(true);
    expect(isBefore(same, skjæring)).toBe(false);
  });

  it('returns empty array when all entries are before cutoff or invalid', () => {
    mockState.gammeltSkjaeringstidspunkt = new Date('2024-06-01');
    mockState.refusjonEndringer = [
      { beloep: 1, dato: new Date('2024-05-31') },
      { beloep: 2 } // no date -> filtered out
    ];

    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toEqual([]);
  });

  it('preserves beloep values exactly', () => {
    mockState.gammeltSkjaeringstidspunkt = new Date('2024-01-01');
    mockState.refusjonEndringer = [
      { beloep: 0, dato: new Date('2024-01-01') },
      { beloep: 999.99, dato: new Date('2024-02-01') }
    ];

    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toEqual([
      { beloep: 0, dato: new Date('2024-01-01') },
      { beloep: 999.99, dato: new Date('2024-02-01') }
    ]);
  });

  it('includes entry when date equals cutoff (boundary condition)', () => {
    const cutoff = new Date('2024-12-31');
    mockState.gammeltSkjaeringstidspunkt = cutoff;
    mockState.refusjonEndringer = [{ beloep: 50, dato: cutoff }];

    const { result } = renderHook(() => useRefusjonEndringerUtenSkjaeringstidspunkt());
    expect(result.current).toEqual([{ beloep: 50, dato: cutoff }]);
  });
});
