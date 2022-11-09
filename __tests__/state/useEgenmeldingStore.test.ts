import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattArbeidsforhold, MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';
import { DateRange } from 'react-day-picker';

const inputArbeidsforhold: Array<MottattArbeidsforhold> = [
  { arbeidsforholdId: 'arbeidsforhold1', arbeidsforhold: 'arbeidsforhold1', stillingsprosent: 60 },
  { arbeidsforholdId: 'arbeidsforhold2', arbeidsforhold: 'arbeidsforhold2', stillingsprosent: 40 }
];
const egenmeldingsperioder: { [key: string]: Array<MottattPeriode> } = {
  arbeidsforhold1: [
    { fra: '2022-06-06', til: '2022-07-06' },
    { fra: '2022-08-06', til: '2022-09-06' },
    { fra: '2022-10-06', til: '2022-11-06' }
  ],
  arbeidsforhold2: [
    { fra: '2022-07-06', til: '2022-08-06' },
    { fra: '2022-09-06', til: '2022-10-06' },
    { fra: '2022-11-06', til: '2022-12-06' }
  ],
  arbeidsforhold22: []
};

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
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 6, 6));
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(3);
  });

  it('should initialize the data even if we have more arbeidsforhold than egenmeldingsgreier.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    const inputArbeidsforholdSpesial: Array<MottattArbeidsforhold> = [
      { arbeidsforholdId: 'arbeidsforhold1', arbeidsforhold: 'arbeidsforhold1', stillingsprosent: 60 },
      { arbeidsforholdId: 'arbeidsforhold2', arbeidsforhold: 'arbeidsforhold2', stillingsprosent: 30 },
      { arbeidsforholdId: 'arbeidsforhold33', arbeidsforhold: 'arbeidsforhold33', stillingsprosent: 10 }
    ];

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforholdSpesial, egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 6, 6));
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(3);
  });

  it('should set the egenmelding fra dato for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    const periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;

    act(() => {
      result.current.setEgenmeldingFraDato(new Date(2022, 5, 15), periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 5, 15));
  });

  it('should set the egenmelding til dato for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    const periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;

    act(() => {
      result.current.setEgenmeldingTilDato(new Date(2022, 5, 15), periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 5, 15));
  });

  it('should delete the egenmelding for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    let periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(3);

    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(2);

    periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(1);

    periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;
    act(() => {
      result.current.slettEgenmeldingsperiode(periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.length).toBe(1);
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].fra).toBeUndefined();
  });

  it('should add a egenmelding for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold2?.length).toBe(3);

    act(() => {
      result.current.leggTilEgenmeldingsperiode('arbeidsforhold2');
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold2?.length).toBe(4);
  });

  it('should add a egenmelding for å given arbeidsforholdId, even when it is unknown.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold3).toBeUndefined();

    act(() => {
      result.current.leggTilEgenmeldingsperiode('arbeidsforhold3');
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold3?.length).toBe(1);
  });

  it('should add a egenmelding for å given arbeidsforholdId, even when it is unknown and the store is uninitialized.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.egenmeldingsperioder?.arbeidsforhold3).toBeUndefined();

    act(() => {
      result.current.leggTilEgenmeldingsperiode('arbeidsforhold3');
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold3?.length).toBe(1);
  });

  it('should set the egenmelding datospenn for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: DateRange = {
      from: new Date(2022, 4, 14),
      to: new Date(2022, 5, 15)
    };

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    const periodeId = result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].id;

    act(() => {
      result.current.setEgenmeldingDato(datoSpenn, periodeId);
    });

    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 5, 15));
    expect(result.current.egenmeldingsperioder?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 4, 14));
  });

  it('should add a backup of egenmelding opprinneligEgenmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder).toEqual(result.current.opprinneligEgenmeldingsperiode);
  });

  it('should copy arbeidsforhold1 to arbeidsforhold2, ignoring the ids.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    act(() => {
      result.current.setSammeEgenmeldingsperiodeArbeidsforhold('arbeidsforhold1', true);
    });

    const af1 = result.current.egenmeldingsperioder['arbeidsforhold1'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));
    const af2 = result.current.egenmeldingsperioder['arbeidsforhold2'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));

    expect(af1).toEqual(af2);
    expect(result.current.sammeEgenmeldingsperiode).toBeTruthy();
  });

  it('should set endre egenmeldingmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    expect(result.current.endreEgenmeldingsperiode['arbeidsforhold1']).toBeFalsy();
    expect(result.current.endreEgenmeldingsperiode['arbeidsforhold2']).toBeFalsy();

    act(() => {
      result.current.setEndreEgenmelding('arbeidsforhold1', true);
    });

    expect(result.current.endreEgenmeldingsperiode['arbeidsforhold1']).toBeTruthy();
    expect(result.current.endreEgenmeldingsperiode['arbeidsforhold2']).toBeFalsy();
  });

  it('should tilbakestille egenmeldingmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(inputArbeidsforhold, egenmeldingsperioder);
    });

    act(() => {
      result.current.setSammeEgenmeldingsperiodeArbeidsforhold('arbeidsforhold1', true);
    });

    const af1 = result.current.egenmeldingsperioder['arbeidsforhold1'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));
    const af2 = result.current.egenmeldingsperioder['arbeidsforhold2'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));

    expect(af1).toEqual(af2);

    act(() => {
      result.current.tilbakestillEgenmelding('arbeidsforhold1');
    });

    const af3 = result.current.egenmeldingsperioder['arbeidsforhold1'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));
    const af4 = result.current.egenmeldingsperioder['arbeidsforhold2'].map((forhold) => ({
      fra: forhold.fra,
      til: forhold.til
    }));

    expect(af3).toEqual(af4);
  });
});
