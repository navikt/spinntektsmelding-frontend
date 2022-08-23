import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattArbeidsforhold, MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';

const inputArbeidsforhold: Array<MottattArbeidsforhold> = [
  { arbeidsforholdId: 'arbeidsforhold1', arbeidsforhold: 'arbeidsforhold1', stillingsprosent: 60 },
  { arbeidsforholdId: 'arbeidsforhold2', arbeidsforhold: 'arbeidsforhold2', stillingsprosent: 40 }
];
const fravaersperiode: { [key: string]: Array<MottattPeriode> } = {
  arbeidsforhold1: [
    { fra: '2022-06-06', til: '2022-07-06' },
    { fra: '2022-08-06', til: '2022-09-06' },
    { fra: '2022-10-06', til: '2022-11-06' }
  ],
  arbeidsforhold2: [
    { fra: '2022-06-07', til: '2022-07-07' },
    { fra: '2022-08-07', til: '2022-09-07' },
    { fra: '2022-10-07', til: '2022-11-07' }
  ]
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
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.fravaersperiode?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 6, 6));
    expect(result.current.fravaersperiode?.arbeidsforhold1?.length).toBe(3);
  });

  it('should set the fravaersmelding fra dato for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.fravaersperiode?.arbeidsforhold1?.[0].id || 'unknown';

    act(() => {
      result.current.setFravaersperiodeFraDato('arbeidsforhold1', periodeId, '2022-06-15');
    });

    expect(result.current.fravaersperiode?.arbeidsforhold1?.[0].fra).toEqual(new Date(2022, 5, 15));
  });

  it('should set the fravaersmelding til dato for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.fravaersperiode?.arbeidsforhold1?.[0].id || 'unknown';

    act(() => {
      result.current.setFravaersperiodeTilDato('arbeidsforhold1', periodeId, '2022-06-15');
    });

    expect(result.current.fravaersperiode?.arbeidsforhold1?.[0].til).toEqual(new Date(2022, 5, 15));
  });

  it('should delete the fravaersperiode for å given periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    const periodeId = result.current.fravaersperiode?.arbeidsforhold1?.[0].id || 'unknown';

    expect(result.current.fravaersperiode?.arbeidsforhold1?.length).toBe(3);

    act(() => {
      result.current.slettFravaersperiode('arbeidsforhold1', periodeId);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold1?.length).toBe(2);
  });

  it('should add a fravaersperiode for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.length).toBe(3);

    act(() => {
      result.current.leggTilFravaersperiode('arbeidsforhold2');
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.length).toBe(4);
  });

  it('should add a new fravaersperiode for a unknown arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });
    const arbeidsforhold = Object.keys(result.current.fravaersperiode!);
    expect(arbeidsforhold.length).toBe(2);

    act(() => {
      result.current.leggTilFravaersperiode('arbeidsforhold3');
    });

    const oppdatertArbeidsforhold = Object.keys(result.current.fravaersperiode!);
    expect(oppdatertArbeidsforhold.length).toBe(3);
    expect(result.current.fravaersperiode?.arbeidsforhold3.length).toBe(1);
    expect(result.current.fravaersperiode?.arbeidsforhold3[0].fra).toBeUndefined();
  });

  test('should add a new fravaersperiode for a unknown arbeidsforholdId when there is no fravaersperiode to begin with.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.leggTilFravaersperiode('arbeidsforhold3');
    });

    const arbeidsforhold = Object.keys(result.current.fravaersperiode!);

    expect(arbeidsforhold.length).toBe(1);

    expect(result.current.fravaersperiode?.arbeidsforhold3.length).toBe(1);
  });

  it('should reset all fravaersperioder for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
      result.current.leggTilFravaersperiode('arbeidsforhold2');
    });

    act(() => {
      result.current.tilbakestillFravaersperiode('arbeidsforhold2');
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.length).toBe(3);
  });

  it('should set all fravaersperioder equal to a given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.[0].fra).toEqual(new Date(2022, 5, 7));
    expect(result.current.sammeFravaersperiode).toBeFalsy();

    act(() => {
      result.current.setSammeFravarePaaArbeidsforhold('arbeidsforhold1', true);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.sammeFravaersperiode).toBeTruthy();
  });

  it('should reset the sammeFravaersperiode flag.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initFravaersperiode(fravaersperiode);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.[0].fra).toEqual(new Date(2022, 5, 7));
    expect(result.current.sammeFravaersperiode).toBeFalsy();

    act(() => {
      result.current.setSammeFravarePaaArbeidsforhold('arbeidsforhold1', true);
    });

    expect(result.current.fravaersperiode?.arbeidsforhold2?.[0].fra).toEqual(new Date(2022, 5, 6));
    expect(result.current.sammeFravaersperiode).toBeTruthy();

    act(() => {
      result.current.endreFravaersperiode();
    });

    expect(result.current.sammeFravaersperiode).toBeFalsy();
  });
});
