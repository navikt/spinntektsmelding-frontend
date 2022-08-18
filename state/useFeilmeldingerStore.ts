import { StateCreator } from 'zustand';
import produce from 'immer';
import { ValiderTekster } from '../utils/submitInntektsmelding';
import { EgenmeldingState } from './useEgenmeldingStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { NaturalytelserState } from './useNaturalytelserStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface FeilmeldingerState {
  skalViseFeilmeldinger: boolean;
  feilmeldinger: Array<ValiderTekster> | [];
  visFeilmeldingsTekst: (feilmelding: string) => string;
  visFeilmelding: (feilmelding: string | undefined) => boolean;
  leggTilFeilmelding: (felt: string, melding: string) => void;
  slettFeilmelding: (felt: string) => void;
  setSkalViseFeilmeldinger: (status: boolean) => void;
  fyllFeilmeldinger: (feilmeldinger: Array<ValiderTekster>) => void;
}

const useFeilmeldingerStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    EgenmeldingState &
    BruttoinntektState &
    ArbeidsforholdState &
    BehandlingsdagerState,
  [],
  [],
  FeilmeldingerState
> = (set, get) => ({
  skalViseFeilmeldinger: false,
  feilmeldinger: [],
  visFeilmeldingsTekst: (feltnavn: string) => {
    const feilmeldinger = get().feilmeldinger;

    if (!feilmeldinger || feilmeldinger.length === 0 || !feltnavn) {
      return '';
    }

    const melding: ValiderTekster | undefined = feilmeldinger.find((feilmelding) => feilmelding.felt === feltnavn);

    return melding ? melding.text : '';
  },

  visFeilmelding: (feltnavn) => {
    const feilmeldinger = get().feilmeldinger;

    return get().skalViseFeilmeldinger && feilmeldinger.some((melding) => melding.felt === feltnavn);
  },

  leggTilFeilmelding: (felt, melding) => {
    set(
      produce((state) => {
        state.feilmeldinger.push({
          felt: felt,
          text: melding
        });

        return state;
      })
    );
  },

  slettFeilmelding: (felt) => {
    set(
      produce((state) => {
        delete state.feilmeldinger[felt];

        return state;
      })
    );
  },

  setSkalViseFeilmeldinger: (status) => {
    set(
      produce((state) => {
        state.skalViseFeilmeldinger = status;

        return state;
      })
    );
  },
  fyllFeilmeldinger: (feilmeldinger) => {
    set(
      produce((state) => {
        state.feilmeldinger = feilmeldinger;

        return state;
      })
    );
  }
});

export default useFeilmeldingerStore;
