import useStateInit from '../../state/useStateInit';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';

import legacyMottattData from '../../mockdata/mottatData.json';
import parseIsoDate from '../../utils/parseIsoDate';

const mottattData = legacyMottattData as unknown as Parameters<ReturnType<typeof useStateInit>>[0];

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
  it('rendrer ikke pa nytt nar bare urelatert state endres', () => {
    const renderinger = vi.fn();
    renderHook(() => {
      renderinger();
      return useStateInit();
    });
    const opprinneligAntall = renderinger.mock.calls.length;

    act(() => useBoundStore.getState().setNyInnsending(false));

    expect(renderinger).toHaveBeenCalledTimes(opprinneligAntall);
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
    } as unknown as typeof mottattData.forespurtData;

    act(() => {
      initState.current(mottattData);
    });

    expect(result.current.sykmeldt.navn).toBe('Test Navn Testesen-Navnesen Jr.');

    expect(result.current.bruttoinntekt.bruttoInntekt).toBe(77000);

    expect(result.current.avsender.orgnr).toBe('911206722');

    expect(result.current.forespurtData?.arbeidsgiverperiode).toEqual({ paakrevd: false });
  });
});
