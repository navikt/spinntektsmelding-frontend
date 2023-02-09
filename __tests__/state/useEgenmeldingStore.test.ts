import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';
import { PeriodeParam } from '../../components/Bruttoinntekt/Periodevelger';

const egenmeldingsperioder: Array<MottattPeriode> = [
  { fom: '2022-06-06', tom: '2022-07-06' },
  { fom: '2022-08-06', tom: '2022-09-06' },
  { fom: '2022-10-06', tom: '2022-11-06' }
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
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2022, 5, 6));
    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2022, 6, 6));
    expect(result.current.egenmeldingsperioder?.length).toBe(3);
  });

  it('should delete the egenmelding for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    let periodeId = result.current.egenmeldingsperioder?.[0].id;

    expect(result.current.egenmeldingsperioder?.length).toBe(3);

    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(2);

    periodeId = result.current.egenmeldingsperioder?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(1);

    periodeId = result.current.egenmeldingsperioder?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(1);
    expect(result.current.egenmeldingsperioder?.[0].fom).toBeUndefined();
  });

  it('should add a egenmelding for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(3);

    act(() => {
      result.current.leggTilEgenmeldingsperiode();
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(4);
  });

  it('should set the egenmelding datospenn for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: PeriodeParam = {
      fom: new Date(2022, 4, 14),
      tom: new Date(2022, 5, 15)
    };

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    const periodeId = result.current.egenmeldingsperioder?.[0].id;

    act(() => {
      result.current.setEgenmeldingDato(datoSpenn, periodeId);
    });

    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2022, 5, 15));
    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2022, 4, 14));
  });

  it('should add a backup of egenmelding opprinneligEgenmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder).toEqual(result.current.opprinneligEgenmeldingsperiode);
  });

  it('should set endre egenmeldingmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.endreEgenmeldingsperiode).toBeFalsy();

    act(() => {
      result.current.setEndreEgenmelding(true);
    });

    expect(result.current.endreEgenmeldingsperiode).toBeTruthy();
  });
});
