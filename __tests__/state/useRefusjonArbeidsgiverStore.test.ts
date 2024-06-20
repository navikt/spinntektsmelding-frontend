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
    expect(result.current.feilmeldinger[0].felt).toBe('lus-input');
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

    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 1, 9));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 1, 9));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato(new Date(2022, 2, 7));
    });

    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 2, 7));
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

    expect(result.current.feilmeldinger?.[0].felt).toEqual('agp.redusertLoennIAgp.beloep');
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

  it('should init refusjonskrav.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initRefusjonskravetOpphoerer('Ja', new Date(2022, 4, 6), 'Nei');
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.fullLonnIArbeidsgiverPerioden).toBeUndefined();
    expect(result.current.harRefusjonEndringer).toBe('Nei');
    expect(result.current.opprinneligHarRefusjonEndringer).toBe('Nei');
  });

  it('should reset refusjonskrav.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initRefusjonskravetOpphoerer('Ja', new Date(2022, 4, 6), 'Nei');
      result.current.initRefusjonEndringer([{ beloep: 123, dato: new Date(2022, 4, 6) }]);
      result.current.setHarRefusjonEndringer('Nei');
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.fullLonnIArbeidsgiverPerioden).toBeUndefined();
    expect(result.current.harRefusjonEndringer).toBe('Nei');
    expect(result.current.opprinneligHarRefusjonEndringer).toBe('Nei');

    act(() => {
      result.current.refusjonskravetOpphoererStatus('Nei');
      result.current.setHarRefusjonEndringer('Ja');
      result.current.refusjonskravetOpphoererDato(new Date(2022, 4, 8));
      result.current.oppdaterRefusjonEndringer([{ beloep: 234, dato: new Date(2022, 4, 10) }]);
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Nei');
    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 8));
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    act(() => {
      result.current.tilbakestillRefusjoner();
    });

    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.refusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.status).toBe('Ja');
    expect(result.current.opprinneligRefusjonskravetOpphoerer?.opphoersdato).toEqual(new Date(2022, 4, 6));
    expect(result.current.fullLonnIArbeidsgiverPerioden).toBeUndefined();
    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.opprinneligHarRefusjonEndringer).toBe('Nei');
    expect(result.current.refusjonEndringer).toEqual([{ beloep: 123, dato: new Date(2022, 4, 6) }]);
  });
});
