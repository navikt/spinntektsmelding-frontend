import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattArbeidsforhold } from '../../state/MottattData';
import { vi } from 'vitest';

const initialState = useBoundStore.getState();

const inputData: Array<MottattArbeidsforhold> = [
  { arbeidsforholdId: 'forhold1', arbeidsforhold: 'forhold1', stillingsprosent: 60 },
  { arbeidsforholdId: 'forhold2', arbeidsforhold: 'forhold2', stillingsprosent: 40 }
];

describe('useBoundStore', () => {
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
      result.current.initArbeidsforhold(inputData);
    });

    expect(result.current.arbeidsforhold?.[0].arbeidsforhold).toEqual('forhold1');
    expect(result.current.arbeidsforhold?.[0].aktiv).toBeTruthy();
    expect(result.current.arbeidsforhold?.[1].arbeidsforhold).toEqual('forhold2');
    expect(result.current.arbeidsforhold?.[1].aktiv).toBeTruthy();
  });

  it('should set the active state of the given forholdId to true.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initArbeidsforhold(inputData);
      result.current.setAktiveArbeidsforhold(['forhold2']);
    });

    expect(result.current.arbeidsforhold?.[0].arbeidsforhold).toEqual('forhold1');
    expect(result.current.arbeidsforhold?.[0].aktiv).toBeFalsy();
    expect(result.current.arbeidsforhold?.[1].arbeidsforhold).toEqual('forhold2');
    expect(result.current.arbeidsforhold?.[1].aktiv).toBeTruthy();
  });

  it('should return the active state of the arbeidsforhold.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const expected = [
      {
        aktiv: true,
        arbeidsforhold: 'forhold1',
        arbeidsforholdId: 'forhold1',
        stillingsprosent: 60
      },
      {
        aktiv: true,
        arbeidsforhold: 'forhold2',
        arbeidsforholdId: 'forhold2',
        stillingsprosent: 40
      }
    ];

    act(() => {
      result.current.initArbeidsforhold(inputData);
    });

    const resultat1 = result.current.aktiveArbeidsforhold();
    expect(resultat1).toEqual(expected);

    act(() => {
      result.current.setAktiveArbeidsforhold(['forhold2']);
    });

    const resultat = result.current.aktiveArbeidsforhold();
    expect(resultat).toEqual([
      {
        aktiv: true,
        arbeidsforhold: 'forhold2',
        arbeidsforholdId: 'forhold2',
        stillingsprosent: 40
      }
    ]);

    act(() => {
      result.current.setAktiveArbeidsforhold([]);
    });

    const resultat3 = result.current.aktiveArbeidsforhold();
    expect(resultat3).toEqual([]);
  });

  it('should set the active state of the arbeidsforhold, without params.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initArbeidsforhold(inputData);
    });

    act(() => {
      result.current.setAktiveArbeidsforhold();
    });

    const resultat3 = result.current.aktiveArbeidsforhold();
    expect(resultat3).toEqual([]);
  });

  it('should return the active state of the arbeidsforhold when the thing has not been initialized.', () => {
    const { result: clean } = renderHook(() => useBoundStore((state) => state));

    const resultat3 = clean.current.aktiveArbeidsforhold();
    expect(resultat3).toEqual([]);
  });
});
