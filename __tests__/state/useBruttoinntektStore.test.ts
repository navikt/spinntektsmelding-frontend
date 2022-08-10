import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import useBruttoinntektStore from '../../state/useBruttoinntektStore';
import { MottattHistoriskInntekt } from '../../state/MottattData';
import { vi } from 'vitest';

const inputInntekt: number = 40000;
const tidligereInntekt: Array<MottattHistoriskInntekt> = [
  { maanedsnavn: 'Januar', inntekt: 33000 },
  { maanedsnavn: 'Februar', inntekt: 44000 },
  { maanedsnavn: 'Mars', inntekt: 55000 }
];

describe('useBruttoinntektStore', () => {
  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useBruttoinntektStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt);
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toEqual(40000);
    expect(result.current.bruttoinntekt?.bekreftet).toBeFalsy();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.tidligereInntekt?.length).toBe(3);
  });

  it('should set the bekreftet flag.', () => {
    const { result } = renderHook(() => useBruttoinntektStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt);
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
    const { result } = renderHook(() => useBruttoinntektStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt);
    });

    act(() => {
      result.current.setNyMaanedsinntekt('56000,23');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(56000.23);
  });

  it('should set ny endringsaarsak.', () => {
    const { result } = renderHook(() => useBruttoinntektStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt);
    });

    act(() => {
      result.current.setEndringsaarsak('AARSAK');
    });

    expect(result.current.bruttoinntekt?.endringsaarsak).toBe('AARSAK');
  });

  it('should tilbakestille endringsaarsak', () => {
    const { result } = renderHook(() => useBruttoinntektStore((state) => state));

    act(() => {
      result.current.initBruttioinntekt(inputInntekt, tidligereInntekt);
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
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(40000);
  });
});
