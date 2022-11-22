import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';
import { DateRange } from 'react-day-picker';

const fravaersperiode: Array<MottattPeriode> = [
  { fra: '2022-06-06', til: '2022-07-06' },
  { fra: '2022-08-06', til: '2022-09-06' },
  { fra: '2022-10-06', til: '2022-11-06' }
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

    expect(result.current.fravaersperioder?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.fravaersperioder?.[0].til).toEqual(new Date(2022, 6, 6));
    expect(result.current.fravaersperioder?.length).toBe(3);
  });

  it('should delete the fravaersperiode for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.fravaersperioder?.[0].id || 'unknown';

    expect(result.current.fravaersperioder?.length).toBe(3);

    act(() => {
      result.current.slettFravaersperiode(periodeId);
    });

    expect(result.current.fravaersperioder?.length).toBe(2);
  });

  it('should add a fravaersperiode for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.fravaersperioder?.length).toBe(3);

    act(() => {
      result.current.leggTilFravaersperiode();
    });

    expect(result.current.fravaersperioder?.length).toBe(4);
  });

  it('should reset all fravaersperioder for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
      result.current.leggTilFravaersperiode();
    });

    act(() => {
      result.current.tilbakestillFravaersperiode();
    });

    expect(result.current.fravaersperioder?.length).toBe(3);
  });

  it('should set the egenmelding datospenn for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: DateRange = {
      from: new Date(2022, 4, 14),
      to: new Date(2022, 5, 15)
    };

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.fravaersperioder?.[0].id;

    act(() => {
      result.current.setFravaersperiodeDato(periodeId || '1', datoSpenn);
    });

    expect(result.current.fravaersperioder?.[0].til).toEqual(new Date(2022, 5, 15));
    expect(result.current.fravaersperioder?.[0].fra).toEqual(new Date(2022, 4, 14));
  });
});
