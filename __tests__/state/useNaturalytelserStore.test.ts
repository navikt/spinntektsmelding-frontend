import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import { Naturalytelse } from '../../state/state';
import parseIsoDate from '../../utils/parseIsoDate';

const inputNaturalytelser: Array<Naturalytelse> = [
  { naturalytelse: 'ANNET', sluttdato: parseIsoDate('2022-07-06')!, verdiBeloep: 300 },
  { naturalytelse: 'TILSKUDDBARNEHAGEPLASS', sluttdato: parseIsoDate('2022-07-06')!, verdiBeloep: 3000 },
  { naturalytelse: 'BIL', sluttdato: parseIsoDate('2022-07-06')!, verdiBeloep: 700 },
  { naturalytelse: 'RENTEFORDELLAAN', sluttdato: parseIsoDate('2022-07-06')!, verdiBeloep: 350 }
];

const initialState = useBoundStore.getState();

describe('useBoundStore', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    expect(result.current.naturalytelser?.[0].naturalytelse).toBe('ANNET');
    expect(result.current.naturalytelser?.[0].sluttdato).toEqual(new Date(2022, 6, 6));
    expect(result.current.naturalytelser?.length).toBe(4);
  });

  it('should delete all naturalytelser.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    expect(result.current.naturalytelser?.length).toBe(4);

    act(() => {
      result.current.slettAlleNaturalytelser();
    });

    expect(result.current.naturalytelser).toBeUndefined();
  });
});
