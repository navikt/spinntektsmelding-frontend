import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import testFnr from '../../mockdata/testFnr';
import { ValiderTekster } from '../../utils/useValiderInntektsmelding';

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

    resultat = result.current.visFeilmeldingsTekst('felt2');

    expect(resultat).toBe('text2');
  });

  it('should NOT show feilmeldinger message.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: string;

    act(() => {
      result.current.fyllFeilmeldinger(inputFeil);
    });

    resultat = result.current.visFeilmeldingsTekst('felt2');

    expect(resultat).toBe('');
  });

  it('should NOT show feilmeldinger message if there are no messages.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    let resultat: string;

    act(() => {
      result.current.setSkalViseFeilmeldinger(true);
    });

    resultat = result.current.visFeilmeldingsTekst('felt2');

    expect(resultat).toBe('');
  });
});
