import { act, cleanup, renderHook } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret } from '../../state/state';

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

  it('should set the status on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Ja');
  });

  it('should change the status on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
  });

  it('should set the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('Begrunnelse');
  });

  it('should set the empty begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('');
    expect(result.current.feilmeldinger[0].felt).toBe('agp.redusertLoennIAgp.begrunnelse');
  });

  it('should change the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('Begrunnelse');

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('Ny begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('Ny begrunnelse');
  });

  it('should set the beloep on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('567,89');
    });

    expect(result.current.lonnISykefravaeret?.beloep).toBe(567.89);
  });

  it('should set the empty beloep on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('');
    });

    expect(result.current.lonnISykefravaeret?.beloep).toBeUndefined();
    expect(result.current.feilmeldinger[0].felt).toBe('refusjon.beloepPerMaaned');
  });

  it('should change the beloep on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('567,89');
    });

    expect(result.current.lonnISykefravaeret?.beloep).toBe(567.89);

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('777,88');
    });

    expect(result.current.lonnISykefravaeret?.beloep).toBe(777.88);
  });

  it('should init fullLonnIArbeidsgiverPerioden.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 1234
    };

    act(() => {
      result.current.initFullLonnIArbeidsgiverPerioden(input);
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('ArbeidOpphoert');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toBe(1234);
  });

  it('should delete fullLonnIArbeidsgiverPerioden.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 1234
    };

    act(() => {
      result.current.initFullLonnIArbeidsgiverPerioden(input);
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');

    act(() => {
      result.current.slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBeUndefined();
  });

  it('should delete fullLonnIArbeidsgiverPerioden again.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden).toEqual({ status: undefined });
  });

  it('should init lonnISykefravaeret.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: LonnISykefravaeret = {
      status: 'Nei',
      beloep: 1234
    };

    act(() => {
      result.current.initLonnISykefravaeret(input);
    });

    expect(result.current.lonnISykefravaeret?.status).toBe('Nei');
    expect(result.current.lonnISykefravaeret?.beloep).toBe(1234);
  });
});
