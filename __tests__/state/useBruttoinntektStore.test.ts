import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattHistoriskInntekt } from '../../state/MottattData';
import { vi } from 'vitest';
import feiltekster from '../../utils/feiltekster';
import { finnAktuelleInntekter, sorterInntekter } from '../../state/useBruttoinntektStore';

const inputInntekt: number = 40000;
const tidligereInntekt: Array<MottattHistoriskInntekt> = [
  { maanedsnavn: '2002-02', inntekt: 33000 },
  { maanedsnavn: '2002-03', inntekt: 44000 },
  { maanedsnavn: '2002-04', inntekt: 55000 },
  { maanedsnavn: '2002-05', inntekt: 55000 },
  { maanedsnavn: '2002-06', inntekt: 55000 },
  { maanedsnavn: '2002-07', inntekt: 55000 },
  { maanedsnavn: '2002-08', inntekt: 50000 },
  { maanedsnavn: '2002-09', inntekt: 45000 },
  { maanedsnavn: '2002-10', inntekt: 55000 }
];

describe('useBoundStore', () => {
  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toEqual(50000);
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.tidligereInntekt?.length).toBe(3);
  });

  it('should set the bekreftet flag to true, and let it stay there. To be removed!', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.bekreftKorrektInntekt(true);
    });

    expect(result.current.bruttoinntekt?.bekreftet).toBeTruthy();

    act(() => {
      result.current.bekreftKorrektInntekt(false);
    });

    expect(result.current.bruttoinntekt?.bekreftet).toBeTruthy();
  });

  it('should set ny maanedsinntekt.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntekt('56000,23');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(56000.23);
  });

  it('should return an error when ny maanedsinntekt = -1.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntekt('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger).toContainEqual({
      felt: 'inntekt.beregnetInntekt',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should return undefined when ny maanedsinntekt = 0.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntekt('0');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(0);
    expect(result.current.feilmeldinger[1]).toBeUndefined();
  });

  it('should return an error when ny maanedsinntekt = 0. Skjema er blankt, ikke preutfylt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektBlanktSkjema('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger).toContainEqual({
      felt: 'inntekt.beregnetInntekt',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should return an error when ny maanedsinntekt = 0. Skjema er blankt, ikke preutfylt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektBlanktSkjema('1234,56');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(1234.56);
    expect(result.current.feilmeldinger.length).toBe(0);
  });

  it('should set ny endringsaarsak.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsak('AARSAK');
    });

    expect(result.current.bruttoinntekt?.endringsaarsak).toBe('AARSAK');
  });

  it('should tilbakestille endringsaarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsak('AARSAK');
      result.current.setNyMaanedsinntekt('56000,23');
      result.current.bekreftKorrektInntekt(true);
    });

    act(() => {
      result.current.tilbakestillMaanedsinntekt();
    });

    expect(result.current.bruttoinntekt?.endringsaarsak).toBe('');
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(50000);
  });

  it('should find a liste of 3 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 9, 9));

    const expected = [
      {
        inntekt: 45000,
        maanedsnavn: '2002-09'
      },
      {
        inntekt: 50000,
        maanedsnavn: '2002-08'
      },
      {
        inntekt: 55000,
        maanedsnavn: '2002-07'
      }
    ];

    expect(inntekter).toEqual(expected);
  });

  it('should find a liste of no current inntekter as they are too old', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2003, 9, 9));

    expect(inntekter).toEqual([]);
  });

  it('should find a liste of 2 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 3, 9));

    const expected = [
      {
        inntekt: 44000,
        maanedsnavn: '2002-03'
      },
      {
        inntekt: 33000,
        maanedsnavn: '2002-02'
      }
    ];

    expect(inntekter).toEqual(expected);
  });

  it.skip('should rekalkulerBruttioinntekt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.rekalkulerBruttioinntekt(new Date(2002, 11, 11));
    });

    expect(result.current.bruttoinntekt?.endringsaarsak).toBe('');
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(50000);
    expect(result.current.tidligereInntekt).toEqual([
      {
        inntekt: 55000,
        maanedsnavn: '2002-10'
      },
      {
        inntekt: 45000,
        maanedsnavn: '2002-09'
      },
      {
        inntekt: 50000,
        maanedsnavn: '2002-08'
      }
    ]);
  });

  it('should setPermitteringPeriode', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setPermitteringPeriode([{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }]);
    });

    expect(result.current.permittering).toEqual([
      { fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }
    ]);
  });

  it('should setPermisjonPeriode', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setPermisjonPeriode([{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }]);
    });

    expect(result.current.permisjon).toEqual([{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }]);
  });

  it('should setNyStillingDato', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyStillingDato(new Date(2002, 10, 11));
    });

    expect(result.current.nystillingdato).toEqual(new Date(2002, 10, 11));
  });

  it('should setNyStillingsprosentDato', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyStillingsprosentDato(new Date(2002, 10, 11));
    });

    expect(result.current.nystillingsprosentdato).toEqual(new Date(2002, 10, 11));
  });

  it('should setTariffKjentdato', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setTariffKjentdato(new Date(2002, 10, 11));
    });

    expect(result.current.tariffkjentdato).toEqual(new Date(2002, 10, 11));
  });

  it('should setTariffEndringsdato', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setTariffEndringsdato(new Date(2002, 10, 11));
    });

    expect(result.current.tariffendringsdato).toEqual(new Date(2002, 10, 11));
  });

  it('should setLonnsendringDato', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setLonnsendringDato(new Date(2002, 10, 11));
    });

    expect(result.current.lonnsendringsdato).toEqual(new Date(2002, 10, 11));
  });

  it('should setFeriePeriode', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setFeriePeriode([{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }]);
    });

    expect(result.current.permisjon).toEqual([{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11), id: '1' }]);
  });

  it('should return 0 when maanedsnavn are equal', () => {
    const retval = sorterInntekter({ maanedsnavn: '2002-01', inntekt: 0 }, { maanedsnavn: '2002-01', inntekt: 0 });

    expect(retval).toBe(0);
  });

  it('should return -1 when first maanedsnavn is bigger than last', () => {
    const retval = sorterInntekter({ maanedsnavn: '2002-02', inntekt: 0 }, { maanedsnavn: '2002-01', inntekt: 0 });

    expect(retval).toBe(-1);
  });

  it('should return 1 when first maanedsnavn is smaller than last', () => {
    const retval = sorterInntekter({ maanedsnavn: '2002-02', inntekt: 0 }, { maanedsnavn: '2002-03', inntekt: 0 });

    expect(retval).toBe(1);
  });
});
