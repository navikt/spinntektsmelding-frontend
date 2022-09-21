import { StateCreator } from 'zustand';
import produce from 'immer';
import { HistoriskInntekt, Inntekt } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import { nanoid } from 'nanoid';
import { MottattHistoriskInntekt } from './MottattData';
import feiltekster from '../utils/feiltekster';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import { FeilmeldingerState, leggTilFeilmelding, slettFeilmelding } from './useFeilmeldingerStore';
import { NaturalytelserState } from './useNaturalytelserStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  inntektsprosent?: { [key: string]: number };
  inntektsprosentEndret: boolean;
  setNyMaanedsinntekt: (belop: string) => void;
  setNyArbeidsforholdMaanedsinntekt: (arbeidsforholdId: string, belop: string) => void;
  setEndringsaarsak: (aarsak: string) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean) => void;
  initBruttioinntekt: (bruttoInntekt: number, tidligereInntekt: Array<MottattHistoriskInntekt>) => void;
}

const useBruttoinntektStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    BruttoinntektState &
    ArbeidsforholdState &
    BehandlingsdagerState &
    EgenmeldingState,
  [],
  [],
  BruttoinntektState
> = (set, get) => ({
  bruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  tidligereInntekt: undefined,
  inntektsprosentEndret: false,
  setNyMaanedsinntekt: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;
        if (state.bruttoinntekt.bruttoInntekt && state.bruttoinntekt.bruttoInntekt > 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),
  setNyMaanedsinntektBlanktSkjema: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = false;
        state.bruttoinntekt.bekreftet = true;
        if (state.bruttoinntekt.bruttoInntekt && state.bruttoinntekt.bruttoInntekt > 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
          state = slettFeilmelding(state, 'bruttoinntektbekreft');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),
  setNyArbeidsforholdMaanedsinntekt: (arbeidsforholdId, belop) => {
    const inntektsprosent: { [key: string]: number } | {} = get().inntektsprosent || {};
    const ikopi = { ...inntektsprosent };
    ikopi[arbeidsforholdId] = stringishToNumber(belop) || 0;
    set(
      produce((state) => {
        state.inntektsprosent = ikopi;
        state.inntektsprosentEndret = true;
        return state;
      })
    );
  },

  setEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        state.bruttoinntekt.manueltKorrigert = true;

        if (aarsak && aarsak !== '') {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsaarsak');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsaarsak', feiltekster.ENDRINGSAARSAK_MANGLER);
        }

        return state;
      })
    ),
  tilbakestillMaanedsinntekt: () =>
    set(
      produce((state) => {
        state.bruttoinntekt = { ...state.opprinneligbruttoinntekt };
        return state;
      })
    ),
  bekreftKorrektInntekt: (bekreftet: boolean) =>
    set(
      produce((state) => {
        state.bruttoinntekt!.bekreftet = bekreftet;
        if (bekreftet === true) {
          state = slettFeilmelding(state, 'bruttoinntektbekreft');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntektbekreft', feiltekster.IKKE_BEKREFTET);
        }

        return state;
      })
    ),
  initBruttioinntekt: (bruttoInntekt: number, tidligereInntekt: Array<MottattHistoriskInntekt>) => {
    const inntektsprosent: { [key: string]: number } | [] = [];

    set(
      produce((state) => {
        state.bruttoinntekt = {
          bruttoInntekt: bruttoInntekt,
          bekreftet: false,
          manueltKorrigert: false,
          endringsaarsak: ''
        };
        state.opprinneligbruttoinntekt = {
          bruttoInntekt: bruttoInntekt,
          bekreftet: false,
          manueltKorrigert: false,
          endringsaarsak: ''
        };

        state.inntektsprosent = inntektsprosent;

        if (tidligereInntekt) {
          state.tidligereInntekt = tidligereInntekt.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt,
            id: nanoid()
          }));
        }

        return state;
      })
    );
  }
});

export default useBruttoinntektStore;
