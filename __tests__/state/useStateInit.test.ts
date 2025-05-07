import useStateInit from '../../state/useStateInit';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';

import mottattData from '../../mockdata/mottatData.json';
import parseIsoDate from '../../utils/parseIsoDate';

const initialState = useBoundStore.getState();

describe('useStateInit', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });
  it('should fill the state correctly', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: initState } = renderHook(() => useStateInit());

    act(() => {
      initState.current(mottattData);
    });

    expect(result.current.sykmeldt.navn).toBe('Test Navn Testesen-Navnesen Jr.');

    expect(result.current.bruttoinntekt.bruttoInntekt).toBe(77000);

    expect(result.current.avsender.orgnr).toBe('911206722');
  });

  it('should fill the state correctly and add some forespurtData', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: initState } = renderHook(() => useStateInit());

    mottattData.forespurtData = {
      arbeidsgiverperiode: { paakrevd: false },
      inntekt: { paakrevd: true, forslag: null },
      refusjon: { paakrevd: true, forslag: { perioder: [], opphoersdato: null } }
    };

    act(() => {
      initState.current(mottattData);
    });

    expect(result.current.sykmeldt.navn).toBe('Test Navn Testesen-Navnesen Jr.');

    expect(result.current.bruttoinntekt.bruttoInntekt).toBe(77000);

    expect(result.current.avsender.orgnr).toBe('911206722');

    expect(result.current.forespurtData?.arbeidsgiverperiode).toEqual({ paakrevd: false });
  });
});
