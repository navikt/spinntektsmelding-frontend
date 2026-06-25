import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../schema/ForespurtDataSchema';
import { vi } from 'vitest';
import { PeriodeParam } from '../../components/Bruttoinntekt/Periodevelger';

const errorSpy = vi.fn();

vi.mock('next/router', () => require('next-router-mock'));
vi.mock('@navikt/next-logger', () => ({ logger: { error: (...args: any[]) => errorSpy(...args) } }));

const fravaersperiode: Array<MottattPeriode> = [
  { fom: '2025-06-06', tom: '2025-07-06' },
  { fom: '2025-08-06', tom: '2025-09-06' },
  { fom: '2025-10-06', tom: '2025-11-06' }
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
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.sykmeldingsperioder?.[0].fom).toEqual(new Date(2025, 5, 6));
    expect(result.current.sykmeldingsperioder?.[0].tom).toEqual(new Date(2025, 6, 6));
    expect(result.current.sykmeldingsperioder?.length).toBe(3);
  });

  it('should delete the fravaersperiode for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.sykmeldingsperioder?.[0].id || 'unknown';

    expect(result.current.sykmeldingsperioder?.length).toBe(3);

    act(() => {
      result.current.slettFravaersperiode(periodeId);
    });

    expect(result.current.sykmeldingsperioder?.length).toBe(2);
  });

  it('should add a fravaersperiode for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.sykmeldingsperioder?.length).toBe(3);

    act(() => {
      result.current.leggTilFravaersperiode();
    });

    expect(result.current.sykmeldingsperioder?.length).toBe(4);
  });

  it('should reset all sykmeldingsperioder for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
      result.current.leggTilFravaersperiode();
    });

    act(() => {
      result.current.tilbakestillFravaersperiode();
    });

    expect(result.current.sykmeldingsperioder?.length).toBe(3);
  });

  it('should set the egenmelding datospenn for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: PeriodeParam = {
      fom: new Date(2025, 4, 14),
      tom: new Date(2025, 5, 15)
    };

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.sykmeldingsperioder?.[0].id;

    act(() => {
      result.current.setFravaersperiodeDato(periodeId || '1', datoSpenn);
    });

    expect(result.current.sykmeldingsperioder?.[0].tom).toEqual(new Date(2025, 5, 15));
    expect(result.current.sykmeldingsperioder?.[0].fom).toEqual(new Date(2025, 4, 14));
  });

  it('should sort the sykmeldingsperioder by fom ascending.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const usorterte: Array<MottattPeriode> = [
      { fom: '2025-10-06', tom: '2025-11-06' },
      { fom: '2025-06-06', tom: '2025-07-06' },
      { fom: '2025-08-06', tom: '2025-09-06' }
    ];

    act(() => {
      result.current.initFravaersperiode(usorterte);
    });

    expect(result.current.sykmeldingsperioder?.map((periode) => periode.fom)).toEqual([
      new Date(2025, 5, 6),
      new Date(2025, 7, 6),
      new Date(2025, 9, 6)
    ]);
  });

  it('should not log an error for valid fravaersperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should log an error for invalid fravaersperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const ugyldige = [{ fom: 'ugyldig-dato', tom: '2025-07-06' }] as unknown as Array<MottattPeriode>;

    act(() => {
      result.current.initFravaersperiode(ugyldige);
    });

    expect(errorSpy).toHaveBeenCalledWith('Feil i initFravaersperiode', expect.anything());
  });
});
