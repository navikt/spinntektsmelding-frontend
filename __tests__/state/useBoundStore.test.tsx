import { describe, expect, it } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, renderHook } from '@testing-library/react';
import useFeilmeldinger from '../../state/useFeilmeldinger';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import { useShallow } from 'zustand/react/shallow';
import { enableMapSet } from 'immer';

enableMapSet();

describe('automatisk reset av useBoundStore', () => {
  it('kan endre state i en test', () => {
    useBoundStore.setState({ nyInnsending: false });

    expect(useBoundStore.getState().nyInnsending).toBe(false);
  });

  it('starter neste test med opprinnelig state og actions', () => {
    expect(useBoundStore.getState()).toBe(useBoundStore.getInitialState());
  });
});

describe('reaktive feilmeldinger', () => {
  it('rendrer bare nar synlige tekster for feltgruppen endres', () => {
    let renderingAntall = 0;
    const { result } = renderHook(() => {
      renderingAntall++;
      return useFeilmeldinger('sykmeldingsperioder');
    });
    const opprinneligAntall = renderingAntall;

    act(() => useBoundStore.getState().leggTilFeilmelding('sykmeldingsperioder', 'Ugyldig periode'));
    expect(renderingAntall).toBe(opprinneligAntall);

    act(() => useBoundStore.getState().setSkalViseFeilmeldinger(true));
    expect(result.current).toEqual({ sykmeldingsperioder: 'Ugyldig periode' });
    const antallMedFeil = renderingAntall;

    act(() => useBoundStore.getState().leggTilFeilmelding('innsender-telefon', 'Ugyldig telefon'));
    expect(renderingAntall).toBe(antallMedFeil);

    act(() => useBoundStore.getState().fyllFeilmeldinger([{ felt: 'sykmeldingsperioder', text: 'Ugyldig periode' }]));
    expect(renderingAntall).toBe(antallMedFeil);

    act(() => useBoundStore.getState().slettFeilmelding('sykmeldingsperioder'));
    expect(result.current).toEqual({});
    expect(renderingAntall).toBe(antallMedFeil + 1);
  });

  it('beholder forste tekst ved duplikater og skjuler feil nar visning slas av', () => {
    useBoundStore.setState({
      skalViseFeilmeldinger: true,
      feilmeldinger: [
        { felt: 'agp.perioder', text: 'Forste feil' },
        { felt: 'agp.perioder', text: 'Andre feil' }
      ]
    });
    const { result } = renderHook(() => useFeilmeldinger('agp.'));
    expect(result.current['agp.perioder']).toBe('Forste feil');

    act(() => useBoundStore.getState().setSkalViseFeilmeldinger(false));
    expect(result.current).toEqual({});
  });
});

describe('avledet skjaeringstidspunkt', () => {
  it('oppdaterer bare nar muligheten til a flytte datoen endres', () => {
    let renderingAntall = 0;
    const { result } = renderHook(() => {
      renderingAntall++;
      return useBoundStore((state) => !state.skjaeringstidspunkt);
    });
    expect(result.current).toBe(true);

    act(() => useBoundStore.getState().setSkjaeringstidspunkt('2026-01-01'));
    expect(result.current).toBe(false);
    const antallMedDato = renderingAntall;

    act(() => useBoundStore.getState().setSkjaeringstidspunkt('2026-02-01'));
    expect(renderingAntall).toBe(antallMedDato);

    act(() => useBoundStore.getState().setSkjaeringstidspunkt(undefined));
    expect(result.current).toBe(true);
    expect(renderingAntall).toBe(antallMedDato + 1);
  });
});

describe('smale abonnementer', () => {
  it('innsendingshookene abonnerer ikke pa callback-only data', () => {
    let renderingAntall = 0;
    renderHook(() => {
      renderingAntall++;
      useSendInnSkjema(() => {}, 'test');
      useSendInnArbeidsgiverInitiertSkjema(() => {}, 'test', SkjemaStatus.FULL);
    });
    const opprinneligAntall = renderingAntall;

    act(() => {
      useBoundStore.setState({
        lonnISykefravaeret: { status: 'Ja' },
        harRefusjonEndringer: 'Ja',
        selvbestemtType: 'Fisker'
      });
    });

    expect(renderingAntall).toBe(opprinneligAntall);
  });

  it('oppdaterer opplysningstyper, men ignorerer samme innhold og urelatert state', () => {
    let renderingAntall = 0;
    const { result } = renderHook(() => {
      renderingAntall++;
      return useBoundStore(useShallow((state) => state.hentPaakrevdOpplysningstyper()));
    });

    act(() => useBoundStore.getState().setPaakrevdeOpplysninger(['inntekt']));
    expect(result.current).toEqual(['inntekt']);
    const antallMedInntekt = renderingAntall;

    act(() => useBoundStore.getState().setPaakrevdeOpplysninger(['inntekt']));
    act(() => useBoundStore.getState().setNyInnsending(false));
    expect(renderingAntall).toBe(antallMedInntekt);

    act(() => useBoundStore.getState().setPaakrevdeOpplysninger(['inntekt', 'refusjon']));
    expect(result.current).toEqual(['inntekt', 'refusjon']);
    expect(renderingAntall).toBe(antallMedInntekt + 1);
  });

  it('varsler om endrede Date- og Map-verdier og bevarer urorte referanser', () => {
    const { result } = renderHook(() => ({
      dato: useBoundStore((state) => state.skjaeringstidspunkt),
      inntekt: useBoundStore((state) => state.tidligereInntekt)
    }));
    act(() => {
      useBoundStore.getState().setSkjaeringstidspunkt('2026-01-01');
      useBoundStore.getState().initBruttoinntekt(1000, { '2025-12': 1000 }, new Date(2026, 0, 1));
    });
    const opprinneligDato = result.current.dato;
    const opprinneligInntekt = result.current.inntekt;

    act(() => useBoundStore.getState().setInnsenderTelefon('12345678'));
    expect(result.current.dato).toBe(opprinneligDato);
    expect(result.current.inntekt).toBe(opprinneligInntekt);

    act(() => useBoundStore.getState().setSkjaeringstidspunkt('2026-02-01'));
    expect(result.current.dato).not.toBe(opprinneligDato);
    expect(result.current.inntekt).toBe(opprinneligInntekt);

    act(() => useBoundStore.getState().setTidligereInntekter({ '2025-12': 2000 }));
    expect(result.current.inntekt).not.toBe(opprinneligInntekt);
    expect(result.current.inntekt?.get('2025-12')).toBe(2000);
    expect(opprinneligInntekt?.get('2025-12')).toBe(1000);
  });
});
