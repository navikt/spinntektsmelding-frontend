import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ValiderResultat, ValiderTekster } from '../../utils/validerInntektsmelding';
import { slettFeilmeldingFraState, leggTilFeilmelding } from '../../state/useFeilmeldingerStore';
import feiltekster from '../../utils/feiltekster';

const inputFeil: Array<ValiderTekster> = [
  {
    felt: 'felt',
    text: 'text'
  },
  {
    felt: 'felt2',
    text: 'text2'
  }
];

const initialState = useBoundStore.getState();

describe('useFeilmeldingerStore', () => {
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
      result.current.fyllFeilmeldinger(inputFeil);
    });

    expect(result.current.feilmeldinger).toEqual(inputFeil);
  });

  it('should add new error', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    act(() => {
      result.current.leggTilFeilmelding('felt3', 'text3');
    });

    expect(result.current.feilmeldinger).toEqual([
      ...inputFeil,
      {
        felt: 'felt3',
        text: 'text3'
      }
    ]);
  });

  it('should delete error.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    act(() => {
      result.current.slettFeilmelding('felt2');
    });

    expect(result.current.feilmeldinger).toEqual([
      {
        felt: 'felt',
        text: 'text'
      }
    ]);
  });

  it('should show feilmeldinger.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: boolean;

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    act(() => {
      result.current.setSkalViseFeilmeldinger(true);
    });

    resultat = result.current.visFeilmelding('felt2');

    expect(resultat).toBe(true);
  });

  it('should show feilmeldinger.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: boolean;

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    act(() => {
      result.current.setSkalViseFeilmeldinger(false);
    });

    resultat = result.current.visFeilmelding('felt2');

    expect(resultat).toBe(false);
  });

  it('should show feilmeldinger message.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: string;

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    act(() => {
      result.current.setSkalViseFeilmeldinger(true);
    });

    resultat = result.current.visFeilmeldingTekst('felt2');

    expect(resultat).toBe('text2');
  });

  it('should NOT show feilmeldinger message.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: string;

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    resultat = result.current.visFeilmeldingTekst('felt2');

    expect(resultat).toBe('');
  });

  it('should NOT show feilmeldinger message if there are no messages.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: string;

    act(() => {
      result.current.setSkalViseFeilmeldinger(true);
    });

    resultat = result.current.visFeilmeldingTekst('felt2');

    expect(resultat).toBe('');
  });

  describe('oppdaterFeilmeldinger', () => {
    it('slår opp tekst fra feiltekster for kjent feilkode', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));
      const feilkoder: Array<ValiderResultat> = [{ felt: 'arbeidsgiverperioder-0', code: 'MANGLER_PERIODE' }];

      let oppdatert: Array<ValiderTekster> = [];
      act(() => {
        oppdatert = result.current.oppdaterFeilmeldinger(feilkoder, 'arbeidsgiverperioder');
      });

      expect(oppdatert).toEqual([{ felt: 'arbeidsgiverperioder-0', text: feiltekster.MANGLER_PERIODE }]);
    });

    it('bruker koden som tekst når koden ikke finnes i feiltekster', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));
      const feilkoder: Array<ValiderResultat> = [{ felt: 'noe-felt', code: 'UKJENT_KODE' as any }];

      let oppdatert: Array<ValiderTekster> = [];
      act(() => {
        oppdatert = result.current.oppdaterFeilmeldinger(feilkoder, 'noe');
      });

      expect(oppdatert).toEqual([{ felt: 'noe-felt', text: 'UKJENT_KODE' }]);
    });

    it('beholder feilmeldinger med annet prefix, fjerner de med samme prefix', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const eksisterende: Array<ValiderTekster> = [
        { felt: 'arbeidsgiverperioder-0', text: 'gammel feil' },
        { felt: 'inntekt-0', text: 'inntektfeil' }
      ];

      act(() => {
        result.current.fyllFeilmeldinger(eksisterende);
      });

      const nyeFeilkoder: Array<ValiderResultat> = [{ felt: 'arbeidsgiverperioder-1', code: 'MANGLER_FRA' }];

      let oppdatert: Array<ValiderTekster> = [];
      act(() => {
        oppdatert = result.current.oppdaterFeilmeldinger(nyeFeilkoder, 'arbeidsgiverperioder');
      });

      expect(oppdatert).toEqual([
        { felt: 'inntekt-0', text: 'inntektfeil' },
        { felt: 'arbeidsgiverperioder-1', text: feiltekster.MANGLER_FRA }
      ]);
    });

    it('returnerer tom liste når ingen feilkoder og ingen eksisterende', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      let oppdatert: Array<ValiderTekster> = [{ felt: 'dummy', text: 'dummy' }];
      act(() => {
        oppdatert = result.current.oppdaterFeilmeldinger([], 'arbeidsgiverperioder');
      });

      expect(oppdatert).toEqual([]);
    });
  });
});

describe('slettFeilmeldingFraState', () => {
  it('fjerner feilmelding med gitt felt', () => {
    const state = useBoundStore.getState();
    state.feilmeldinger = [
      { felt: 'felt1', text: 'feil1' },
      { felt: 'felt2', text: 'feil2' }
    ];

    slettFeilmeldingFraState(state, 'felt1');

    expect(state.feilmeldinger).toEqual([{ felt: 'felt2', text: 'feil2' }]);
  });

  it('gjør ingenting når felt ikke finnes', () => {
    const state = useBoundStore.getState();
    state.feilmeldinger = [{ felt: 'felt1', text: 'feil1' }];

    slettFeilmeldingFraState(state, 'finnes-ikke');

    expect(state.feilmeldinger).toEqual([{ felt: 'felt1', text: 'feil1' }]);
  });
});

describe('leggTilFeilmelding', () => {
  it('legger til feilmelding i state', () => {
    const state = useBoundStore.getState();
    state.feilmeldinger = [];

    leggTilFeilmelding(state, 'nyttFelt', 'ny feil');

    expect(state.feilmeldinger).toEqual([{ felt: 'nyttFelt', text: 'ny feil' }]);
  });

  it('legger til feilmelding uten å fjerne eksisterende', () => {
    const state = useBoundStore.getState();
    state.feilmeldinger = [{ felt: 'eksisterende', text: 'gammel' }];

    leggTilFeilmelding(state, 'ny', 'ny feil');

    expect(state.feilmeldinger).toEqual([
      { felt: 'eksisterende', text: 'gammel' },
      { felt: 'ny', text: 'ny feil' }
    ]);
  });
});

describe('feiltekster', () => {
  it('inneholder MANGLER_PERIODE med norsk tekst', () => {
    expect(feiltekster.MANGLER_PERIODE).toBe('Du må legge til minst en periode.');
  });
});
