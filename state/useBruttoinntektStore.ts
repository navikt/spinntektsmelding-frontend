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
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { NaturalytelserState } from './useNaturalytelserStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  bruttoinntektFeilmeldinger: {
    bruttoInntekt?: string;
    bekreftet?: string;
    endringsaarsak?: string;
  };
  tidligereInntekt?: Array<HistoriskInntekt>;
  setNyMaanedsinntekt: (belop: string) => void;
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
> = (set) => ({
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
  bruttoinntektFeilmeldinger: {
    bruttoInntekt: feiltekster.BRUTTOINNTEKT_MANGLER,
    bekreftet: feiltekster.IKKE_BEKREFTET,
    endringsaarsak: feiltekster.ENDRINGSAARSAK_MANGLER
  },
  tidligereInntekt: undefined,
  setNyMaanedsinntekt: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;

        return state;
      })
    ),
  setEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        state.bruttoinntekt.manueltKorrigert = true;
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
        state.bruttoinntektFeilmeldinger.bekreftet = bekreftet ? '' : feiltekster.IKKE_BEKREFTET;
        return state;
      })
    ),
  initBruttioinntekt: (bruttoInntekt: number, tidligereInntekt: Array<MottattHistoriskInntekt>) =>
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

        if (tidligereInntekt) {
          state.tidligereInntekt = tidligereInntekt.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt,
            id: nanoid()
          }));
        }
      })
    )
});

export default useBruttoinntektStore;
