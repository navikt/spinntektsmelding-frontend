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

  it('should set init stuff.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const forespurtData = {
      arbeidsgiverperiode: { paakrevd: false },
      inntekt: {
        paakrevd: true,
        forslag: {
          type: 'ForslagInntektGrunnlag',
          beregningsmaaneder: ['2022-10', '2022-11', '2022-09'],
          forrigeInntekt: { skjæringstidspunkt: '2022-01-02', kilde: 'INNTEKTSMELDING', beløp: 48000.0 }
        }
      },
      refusjon: {
        paakrevd: true,
        forslag: {
          perioder: [
            { fom: '2023-01-02', beloep: 46000.0 },
            { fom: '2023-09-30', beloep: 0.0 }
          ],
          opphoersdato: null
        }
      }
    };

    const input: Opplysningstype[] = ['inntekt', 'refusjon'];

    act(() => {
      result.current.initForespurtData(forespurtData);
    });
    let typer;
    act(() => {
      typer = result.current.hentPaakrevdOpplysningstyper();
    });

    expect(typer).toEqual(input);
    expect(result.current.fastsattInntekt).toBe(48000);
    expect(result.current.gammeltSkjaeringstidspunkt).toEqual(parseISO('2022-01-02'));
    expect(result.current.bruttoinntekt.bruttoInntekt).toBe(48000);
  });

  it('should set the refusjonsbelop', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initForespurtData({
        arbeidsgiverperiode: { paakrevd: false },
        inntekt: {
          paakrevd: true,
          forslag: {
            type: 'ForslagInntektGrunnlag',
            beregningsmaaneder: ['2023-05', '2023-06', '2023-07'],
            forrigeInntekt: { skjæringstidspunkt: '2023-08-28', kilde: 'INNTEKTSMELDING', beløp: 33750.0 }
          }
        },
        refusjon: {
          paakrevd: true,
          forslag: {
            perioder: [],
            opphoersdato: null
          }
        }
      });
    });

    expect(result.current.forespurtData?.inntekt?.forslag?.forrigeInntekt?.beløp).toBe(33750);
    expect(result.current.forespurtData?.refusjon?.forslag?.perioder).toEqual([]);
    expect(result.current.refusjonTilArbeidsgiver).toBeUndefined();
    expect(result.current.lonnISykefravaeret?.belop).toBe(0);
    expect(result.current.lonnISykefravaeret?.status).toBe('Nei');
    expect(result.current.harRefusjonEndringer).toBeUndefined();
    expect(result.current.refusjonskravetOpphoerer?.status).toBe('Nei');
  });

  it('should verify that bruttoinntekt can be reset', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initForespurtData({
        arbeidsgiverperiode: { paakrevd: false },
        inntekt: {
          paakrevd: true,
          forslag: {
            type: 'ForslagInntektGrunnlag',
            beregningsmaaneder: ['2023-05', '2023-06', '2023-07'],
            forrigeInntekt: { skjæringstidspunkt: '2023-08-28', kilde: 'INNTEKTSMELDING', beløp: 33750.0 }
          }
        },
        refusjon: {
          paakrevd: true,
          forslag: {
            perioder: [],
            opphoersdato: null
          }
        }
      });
    });

    expect(result.current.kanBruttoinntektTilbakebestilles()).toBeTruthy();
  });

  it('should verify that bruttoinntekt can not be reset', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initForespurtData({
        arbeidsgiverperiode: { paakrevd: false },
        inntekt: {
          paakrevd: true,
          forslag: {
            type: 'ForslagInntektGrunnlag',
            beregningsmaaneder: ['2023-05', '2023-06', '2023-07']
          }
        },
        refusjon: {
          paakrevd: true,
          forslag: {
            perioder: [],
            opphoersdato: null
          }
        }
      });
    });

    expect(result.current.kanBruttoinntektTilbakebestilles()).toBeFalsy();
  });
});
