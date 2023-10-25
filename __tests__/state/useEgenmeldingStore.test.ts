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

vi.mock('next/router', () => require('next-router-mock'));

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
      result.current.slettEgenmeldingsperiode(periodeId!);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(2);

    periodeId = result.current.egenmeldingsperioder?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId!);
    });

    expect(result.current.egenmeldingsperioder?.length).toBe(1);

    periodeId = result.current.egenmeldingsperioder?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId!);
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
      result.current.setEgenmeldingDato(datoSpenn, periodeId!);
    });

    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2022, 5, 15));
    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2022, 4, 14));
  });

  it('should set the egenmelding datospenn for a ny periode.', () => {
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
      result.current.setEgenmeldingDato(datoSpenn, 'nyperiode');
    });

    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2022, 5, 15));
    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2022, 4, 14));
    expect(result.current.egenmeldingsperioder?.[0].id).not.toEqual('nyperiode');
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

  it('should set ting tilbake.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.endreEgenmeldingsperiode).toBeFalsy();

    act(() => {
      result.current.setEndreEgenmelding(true);
    });

    expect(result.current.endreEgenmeldingsperiode).toBeTruthy();

    act(() => {
      result.current.tilbakestillEgenmelding();
    });

    expect(result.current.endreEgenmeldingsperiode).toBeFalsy();
  });

  it('should set ting tilbake. And fix bestemmende fraværsdag', () => {
    const egenmeldingsperioder: Array<MottattPeriode> = [{ fom: '2023-04-06', tom: '2023-05-06' }];

    const fravaersperioder: Array<MottattPeriode> = [
      { fom: '2022-12-06', tom: '2023-01-06' },
      { fom: '2023-02-06', tom: '2023-03-06' }
    ];
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    act(() => {
      result.current.initFravaersperiode(fravaersperioder);
    });

    const id = result.current.egenmeldingsperioder![0].id;

    act(() => {
      result.current.setBestemmendeFravaersdag(new Date(2023, 3, 6));
    });

    expect(result.current.bestemmendeFravaersdag).toEqual(new Date(2023, 3, 6));

    act(() => {
      result.current.setEgenmeldingDato({ fom: new Date(2023, 3, 7), tom: new Date(2023, 4, 7) }, id);
    });

    expect(result.current.bestemmendeFravaersdag).toEqual(new Date(2023, 3, 7));

    act(() => {
      result.current.tilbakestillEgenmelding();
    });

    expect(result.current.bestemmendeFravaersdag).toEqual(new Date(2023, 3, 6));
  });
});
