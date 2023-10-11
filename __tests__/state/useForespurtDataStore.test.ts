import { describe, vi } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import { ForrigeInntekt, Opplysningstype } from '../../state/useForespurtDataStore';
import { parseISO } from 'date-fns';

const initialState = useBoundStore.getState();

describe('useForespurtDataStore', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.resetAllMocks();
    // You can chose to set the store's state to a default value here.
    cleanup();
  });

  it('should set tidligere inntekter.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: ForrigeInntekt = {
      skjæringstidspunkt: '2020-01-01',
      kilde: 'INNTEKTSMELDING',
      beløp: 1000
    };

    act(() => {
      result.current.setTidligereInntektsdata(input);
    });

    expect(result.current.fastsattInntekt).toBe(1000);
    expect(result.current.gammeltSkjaeringstidspunkt).toEqual(parseISO('2020-01-01'));
  });

  it('should set paakrevde opplysninger.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: Opplysningstype[] = ['inntekt', 'refusjon'];

    act(() => {
      result.current.setPaakrevdeOpplysninger(input);
    });

    expect(result.current.paakrevdeOpplysninger).toEqual(input);
  });

  it('should hentPaakrevdOpplysningstyper', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const input: Opplysningstype[] = ['inntekt', 'refusjon'];

    act(() => {
      result.current.setPaakrevdeOpplysninger(input);
    });

    let typer;
    act(() => {
      typer = result.current.hentPaakrevdOpplysningstyper();
    });

    expect(typer).toEqual(input);
  });
});
