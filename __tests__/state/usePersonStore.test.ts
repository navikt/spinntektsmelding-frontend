import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import usePersonStore from '../../state/usePersonStore';
import { vi } from 'vitest';
import testFnr from '../../mockdata/testFnr';

const inputPerson: [string, string, string] = ['Navn Navnesen', testFnr.GyldigeFraDolly.TestPerson1, '123456789'];

const initialState = usePersonStore.getState();

describe('usePersonStore', () => {
  beforeEach(() => {
    usePersonStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => usePersonStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    expect(result.current.navn).toBe(inputPerson[0]);
    expect(result.current.identitetsnummer).toBe(inputPerson[1]);
    expect(result.current.orgnrUnderenhet).toBe(inputPerson[2]);
  });

  it('should set the navn', () => {
    const { result } = renderHook(() => usePersonStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    act(() => {
      result.current.setNavn('Et Annet Navn');
    });

    expect(result.current.navn).toBe('Et Annet Navn');
  });

  it('should set the identitetsnummer.', () => {
    const { result } = renderHook(() => usePersonStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    act(() => {
      result.current.setIdentitetsnummer(testFnr.GyldigeFraDolly.TestPerson2);
    });

    expect(result.current.identitetsnummer).toEqual(testFnr.GyldigeFraDolly.TestPerson2);
  });

  it('should set the virksomhetsnavn.', () => {
    const { result } = renderHook(() => usePersonStore((state) => state));

    act(() => {
      result.current.initPerson(...inputPerson);
    });

    act(() => {
      result.current.setOrgUnderenhet({
        Name: 'NAV eksempelfirma',
        Type: 'AS',
        OrganizationNumber: '912834765',
        OrganizationForm: 'Vet ikke',
        Status: 'Eksempel',
        ParentOrganizationNumber: '987654321'
      });
    });

    expect(result.current.orgnrUnderenhet).toBe('912834765');
    expect(result.current.virksomhetsnavn).toBe('NAV eksempelfirma');
  });
});
