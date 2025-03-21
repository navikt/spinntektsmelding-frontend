import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import testFnr from '../../mockdata/testFnr';

const inputPerson: [string, string, string, string] = [
  'Navn Navnesen',
  testFnr.GyldigeFraDolly.TestPerson1,
  '123456789',
  'Org Orgesen AS'
];

const initialState = useBoundStore.getState();

describe('usePersonStore', () => {
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
      result.current.initPerson(...inputPerson);
    });

    expect(result.current.sykmeldt.navn).toBe(inputPerson[0]);
    expect(result.current.sykmeldt.fnr).toBe(inputPerson[1]);
    expect(result.current.avsender.orgnr).toBe(inputPerson[2]);
  });

  it('should set the identitetsnummer.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    act(() => {
      result.current.setIdentitetsnummer(testFnr.GyldigeFraDolly.TestPerson2);
    });

    expect(result.current.sykmeldt.fnr).toEqual(testFnr.GyldigeFraDolly.TestPerson2);
  });

  it('should set the innsender telefon.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    act(() => {
      result.current.setInnsenderTelefon('12345678');
    });

    expect(result.current.avsender.tlf).toBe('12345678');
  });
});
