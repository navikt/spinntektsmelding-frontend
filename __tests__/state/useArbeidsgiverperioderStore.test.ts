import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';
import { Periode } from '../../state/state';
import { nanoid } from 'nanoid';

vi.mock('nanoid');

const arbeidsgiverperioder: Array<MottattPeriode> = [
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

  // it('should initialize the data.', () => {
  //   const { result } = renderHook(() => useBoundStore((state) => state));

  //   act(() => {
  //     result.current.initEgenmeldingsperiode(arbeidsgiverperioder);
  //   });

  //   expect(result.current.arbeidsgiverperioder?.[0].fom).toEqual(new Date(2022, 5, 6));
  //   expect(result.current.arbeidsgiverperioder?.[0].tom).toEqual(new Date(2022, 6, 6));
  //   expect(result.current.arbeidsgiverperioder?.length).toBe(3);
  // });

  // it('should delete the egenmelding for å given periode.', () => {
  //   const { result } = renderHook(() => useBoundStore((state) => state));

  //   act(() => {
  //     result.current.initEgenmeldingsperiode(arbeidsgiverperioder);
  //   });

  //   let periodeId = result.current.arbeidsgiverperioder?.[0].id;

  //   expect(result.current.arbeidsgiverperioder?.length).toBe(3);

  //   act(() => {
  //     result.current.slettEgenmeldingsperiode(periodeId);
  //   });

  //   expect(result.current.arbeidsgiverperioder?.length).toBe(2);

  //   periodeId = result.current.arbeidsgiverperioder?.[0].id;
  //   act(() => {
  //     result.current.slettEgenmeldingsperiode(periodeId);
  //   });

  //   expect(result.current.arbeidsgiverperioder?.length).toBe(1);

  //   periodeId = result.current.arbeidsgiverperioder?.[0].id;
  //   act(() => {
  //     result.current.slettEgenmeldingsperiode(periodeId);
  //   });

  //   expect(result.current.arbeidsgiverperioder?.length).toBe(1);
  //   expect(result.current.arbeidsgiverperioder?.[0].fom).toBeUndefined();
  // });

  it('should set bestemmende fraværsdag.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setBestemmendeFravaersdag(new Date(2022, 5, 5));
    });

    expect(result.current.bestemmendeFravaersdag).toEqual(new Date(2022, 5, 5));
  });

  it('should set the arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);
  });

  it('should add empty arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        id: '2'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    act(() => {
      result.current.leggTilArbeidsgiverperiode();
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it('should delete a arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    // nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 6, 14),
        tom: new Date(2022, 7, 15),
        id: '2'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);

    act(() => {
      result.current.slettArbeidsgiverperiode('2');
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it('should update a arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    // nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 6, 14),
        tom: new Date(2022, 7, 15),
        id: '2'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 8, 14),
        tom: new Date(2022, 9, 15),
        id: '2'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);

    act(() => {
      result.current.setArbeidsgiverperiodeDato(
        {
          fom: new Date(2022, 8, 14),
          tom: new Date(2022, 9, 15)
        },
        '2'
      );
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it('should set endretArbeidsgiverperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setEndreArbeidsgiverperiode(true);
    });

    expect(result.current.endretArbeidsgiverperiode).toBeTruthy();
  });

  it('should set endringsbegrunnelse.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setEndringsbegrunnelse('Begrunnelse!');
    });

    expect(result.current.endringsbegrunnelse).toBe('Begrunnelse!');
  });

  // it('should add a backup of egenmelding opprinneligEgenmelding.', () => {
  //   const { result } = renderHook(() => useBoundStore((state) => state));

  //   act(() => {
  //     result.current.initEgenmeldingsperiode(arbeidsgiverperioder);
  //   });

  //   expect(result.current.arbeidsgiverperioder).toEqual(result.current.opprinneligEgenmeldingsperiode);
  // });

  // it('should set endre egenmeldingmelding.', () => {
  //   const { result } = renderHook(() => useBoundStore((state) => state));

  //   act(() => {
  //     result.current.initEgenmeldingsperiode(arbeidsgiverperioder);
  //   });

  //   expect(result.current.endreEgenmeldingsperiode).toBeFalsy();

  //   act(() => {
  //     result.current.setEndreEgenmelding(true);
  //   });

  //   expect(result.current.endreEgenmeldingsperiode).toBeTruthy();
  // });
});
