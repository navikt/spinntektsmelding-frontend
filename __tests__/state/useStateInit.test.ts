import useStateInit from '../../state/useStateInit';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';

import mottattData from '../../mockdata/mottatData.json';

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

    expect(result.current.feilHentingAvArbeidsgiverdata).toEqual([]);
    expect(result.current.feilHentingAvPersondata).toEqual([
      {
        datafelt: 'arbeidstaker-informasjon',
        melding: 'Vi klarte ikke å hente arbeidstaker informasjon.'
      }
    ]);
    expect(result.current.navn).toBe('Test Navn Testesen-Navnesen Jr.');

    expect(result.current.bruttoinntekt.bruttoInntekt).toBe(77000);

    expect(result.current.orgnrUnderenhet).toBe('911206722');
  });
});
