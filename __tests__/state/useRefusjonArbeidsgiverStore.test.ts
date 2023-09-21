import { act, cleanup, renderHook } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';

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

  it('should set the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('Ja');
    });

    expect(result.current.lonnISykefravaeret?.status).toBe('Ja');
  });

  it('should change the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('Ja');
    });

    expect(result.current.lonnISykefravaeret?.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('Nei');
    });

    expect(result.current.lonnISykefravaeret?.status).toBe('Nei');
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
    expect(result.current.feilmeldinger[0].felt).toBe('lia-select');
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

  it('should set the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('567,89');
    });

    expect(result.current.lonnISykefravaeret?.belop).toBe(567.89);
  });

  it('should set the empty belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('');
    });

    expect(result.current.lonnISykefravaeret?.belop).toBeUndefined();
    expect(result.current.feilmeldinger[0].felt).toBe('lus-input');
  });

  it('should change the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('567,89');
    });

    expect(result.current.lonnISykefravaeret?.belop).toBe(567.89);

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('777,88');
    });

    expect(result.current.lonnISykefravaeret?.belop).toBe(777.88);
  });

  it('should set the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Ja');
  });

  it('should change the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Ja');

    act(() => {
      result.current.refusjonskravetOpphoererStatus('Nei');
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Nei');
  });

  it('should set the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphorsdato).toEqual(new Date(2022, 4, 6));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 1, 9));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphorsdato).toEqual(new Date(2022, 1, 9));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 2, 7));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphorsdato).toEqual(new Date(2022, 2, 7));
  });

  it('should change the setBeloepUtbetaltUnderArbeidsgiverperioden beløp.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setBeloepUtbetaltUnderArbeidsgiverperioden('12345');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toEqual(12345);

    act(() => {
      result.current.setBeloepUtbetaltUnderArbeidsgiverperioden('56478');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toEqual(56478);

    act(() => {
      result.current.setBeloepUtbetaltUnderArbeidsgiverperioden('-56478');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toEqual(-56478);

    expect(result.current.feilmeldinger?.[0].felt).toEqual('lus-uua-input');
  });

  it('should change the setHarRefusjonEndringer beløp.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setHarRefusjonEndringer(true);
    });

    expect(result.current.harRefusjonEndringer).toBeTruthy();
    expect(result.current.refusjonEndringer).toEqual([{}]);

    act(() => {
      result.current.setHarRefusjonEndringer(false);
    });

    expect(result.current.harRefusjonEndringer).toBeFalsy();
  });
});
