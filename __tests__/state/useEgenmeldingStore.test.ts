import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../schema/ForespurtDataSchema';
import { vi } from 'vitest';

const errorSpy = vi.fn();

const egenmeldingsperioder: Array<MottattPeriode> = [
  { fom: '2025-06-06', tom: '2025-07-06' },
  { fom: '2025-08-06', tom: '2025-09-06' },
  { fom: '2025-10-06', tom: '2025-11-06' }
];

const initialState = useBoundStore.getState();

vi.mock('next/router', () => require('next-router-mock'));
vi.mock('@navikt/next-logger', () => ({ logger: { error: (...args: any[]) => errorSpy(...args) } }));

describe('useEgenmeldingStore', () => {
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
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2025, 5, 6));
    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2025, 6, 6));
    expect(result.current.egenmeldingsperioder?.length).toBe(3);
  });

  it('should add a backup of egenmelding opprinneligEgenmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder).toEqual(result.current.opprinneligEgenmeldingsperiode);
  });

  it('should sort the egenmeldingsperioder by fom ascending.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const usorterte: Array<MottattPeriode> = [
      { fom: '2025-10-06', tom: '2025-11-06' },
      { fom: '2025-06-06', tom: '2025-07-06' },
      { fom: '2025-08-06', tom: '2025-09-06' }
    ];

    act(() => {
      result.current.initEgenmeldingsperiode(usorterte);
    });

    expect(result.current.egenmeldingsperioder?.map((periode) => periode.fom)).toEqual([
      new Date(2025, 5, 6),
      new Date(2025, 7, 6),
      new Date(2025, 9, 6)
    ]);
  });

  it('should not log an error for valid egenmeldingsperioder.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should log an error for invalid egenmeldingsperioder.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const ugyldige = [{ fom: 'ugyldig-dato', tom: '2025-07-06' }] as unknown as Array<MottattPeriode>;

    act(() => {
      result.current.initEgenmeldingsperiode(ugyldige);
    });

    expect(errorSpy).toHaveBeenCalledWith('Feil i initEgenmeldingsperiode', expect.anything());
  });

  it('should not log an error for an empty list of egenmeldingsperioder.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode([]);
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
