import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattHistoriskInntekt } from '../../state/MottattData';
import { vi } from 'vitest';
import feiltekster from '../../utils/feiltekster';

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
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toEqual(50000);
    expect(result.current.bruttoinntekt?.bekreftet).toBeFalsy();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.tidligereInntekt?.length).toBe(3);
  });

  it('should set the bekreftet flag.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.bekreftKorrektInntekt(true);
    });

    expect(result.current.bruttoinntekt?.bekreftet).toBeTruthy();

    act(() => {
      result.current.bekreftKorrektInntekt(false);
    });

    expect(result.current.bruttoinntekt?.bekreftet).toBeFalsy();
  });

  it('should set ny maanedsinntekt.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntekt('56000,23');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(56000.23);
  });

  it('should return an error when ny maanedsinntekt = -1.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntekt('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger[1]).toEqual({
      felt: 'bruttoinntekt-endringsbelop',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should return undefined when ny maanedsinntekt = 0.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
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
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektBlanktSkjema('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger[1]).toEqual({
      felt: 'bruttoinntekt-endringsbelop',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should return an error when ny maanedsinntekt = 0. Skjema er blankt, ikke preutfylt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
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
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsak('AARSAK');
    });

    expect(result.current.bruttoinntekt?.endringsaarsak).toBe('AARSAK');
  });

  it('should tilbakestille endringsaarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
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
    expect(result.current.bruttoinntekt?.bekreftet).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(50000);
  });
});
