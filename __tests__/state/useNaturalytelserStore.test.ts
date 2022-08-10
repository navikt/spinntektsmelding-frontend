import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import useNaturalytelserStore from '../../state/useNaturalytelserStore';
import { MottattArbeidsforhold, MottattNaturalytelse } from '../../state/MottattData';
import { vi } from 'vitest';

const inputArbeidsforhold: Array<MottattArbeidsforhold> = [
  { arbeidsforholdId: 'arbeidsforhold1', arbeidsforhold: 'arbeidsforhold1', stillingsprosent: 60 },
  { arbeidsforholdId: 'arbeidsforhold2', arbeidsforhold: 'arbeidsforhold2', stillingsprosent: 40 }
];
const inputNaturalytelser: Array<MottattNaturalytelse> = [
  { type: 'AVIS', bortfallsdato: '2022-07-06', verdi: 300 },
  { type: 'BARNEPASS', bortfallsdato: '2022-07-06', verdi: 3000 },
  { type: 'BIL', bortfallsdato: '2022-07-06', verdi: 700 },
  { type: 'TELEFON', bortfallsdato: '2022-07-06', verdi: 350 }
];

const initialState = useNaturalytelserStore.getState();

describe('useNaturalytelserStore', () => {
  beforeEach(() => {
    useNaturalytelserStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    expect(result.current.naturalytelser?.[0].type).toBe('AVIS');
    expect(result.current.naturalytelser?.[0].bortfallsdato).toEqual(new Date(2022, 6, 6));
    expect(result.current.naturalytelser?.length).toBe(4);
  });

  it('should set the naturalyteles type for a given id.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    const ytelseId = result.current.naturalytelser?.[0].id || 'unknown';

    act(() => {
      result.current.setNaturalytelseType(ytelseId, 'TYPE');
    });

    expect(result.current.naturalytelser?.[0].type).toBe('TYPE');
  });

  it('should set the naturalytelse bortfallsdato for a given id.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    const ytelseId = result.current.naturalytelser?.[0].id || 'unknown';

    act(() => {
      result.current.setNaturalytelseBortfallsdato(ytelseId, '2022-06-15');
    });

    expect(result.current.naturalytelser?.[0].bortfallsdato).toEqual(new Date(2022, 5, 15));
  });

  it('should set the naturalytelse verdi for a given id.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    const ytelseId = result.current.naturalytelser?.[0].id || 'unknown';

    act(() => {
      result.current.setNaturalytelseVerdi(ytelseId, '750,50');
    });

    expect(result.current.naturalytelser?.[0].verdi).toBe(750.5);
  });

  it('should delete the naturalytelser for å given id.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    const ytelseId = result.current.naturalytelser?.[0].id || 'unknown';

    expect(result.current.naturalytelser?.length).toBe(4);

    act(() => {
      result.current.slettNaturalytelse(ytelseId);
    });

    expect(result.current.naturalytelser?.length).toBe(3);
  });

  it('should add a naturalytelse for å given arbeidsforholdId.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    expect(result.current.naturalytelser?.length).toBe(4);

    act(() => {
      result.current.leggTilNaturalytelse();
    });

    expect(result.current.naturalytelser?.length).toBe(5);
  });

  it('should add a naturalytelse even if the store is empty.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.leggTilNaturalytelse();
    });

    expect(result.current.naturalytelser?.length).toBe(1);
  });

  it('should delete all naturalytelser.', () => {
    const { result } = renderHook(() => useNaturalytelserStore((state) => state));

    act(() => {
      result.current.initNaturalytelser(inputNaturalytelser);
    });

    expect(result.current.naturalytelser?.length).toBe(4);

    act(() => {
      result.current.slettAlleNaturalytelser();
    });

    expect(result.current.naturalytelser).toBeUndefined();
  });
});
