import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import testFnr from '../../mockdata/testFnr';

const inputPerson: [string, string, string] = ['Navn Navnesen', testFnr.GyldigeFraDolly.TestPerson1, '123456789'];

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
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Ja');
  });

  it('should change the status on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Nei');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Nei');
  });

  it('should set the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Ja');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Ja');
  });

  it('should change the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Ja');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Nei');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Nei');
  });

  it('should set the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Begrunnelse');
  });

  it('should set the empty begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', '');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('');
    expect(result.current.feilmeldinger[0].felt).toBe('lia-select-id1');
  });

  it('should change the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Begrunnelse');

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Ny begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Ny begrunnelse');
  });

  it('should set the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '567,89');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(567.89);
  });

  it('should set the empty belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBeUndefined();
    expect(result.current.feilmeldinger[0].felt).toBe('lus-input-id1');
  });

  it('should change the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '567,89');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(567.89);

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '777,88');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(777.88);
  });

  it('should set the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Ja');
  });

  it('should change the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Ja');

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Nei');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Nei');
  });

  it('should set the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', new Date(2022, 1, 9));
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 1, 9));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', new Date(2022, 4, 6));
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', new Date(2022, 2, 7));
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 2, 7));
  });
});
