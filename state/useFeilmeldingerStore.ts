import { StateCreator } from 'zustand';
import produce from 'immer';
import { ValiderTekster } from '../utils/useValiderInntektsmelding';
import { CompleteState } from './useBoundStore';

export function slettFeilmelding(state: any, felt: string) {
  state.feilmeldinger = state.feilmeldinger.filter((element: ValiderTekster) => element.felt !== felt);

  return state;
}

export function leggTilFeilmelding(state: any, felt: string, melding: string) {
  state.feilmeldinger.push({
    felt: felt,
    text: melding
  });

  return state;
}

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

const useFeilmeldingerStore: StateCreator<CompleteState, [], [], FeilmeldingerState> = (set, get) => ({
  skalViseFeilmeldinger: false,
  feilmeldinger: [],
  visFeilmeldingsTekst: (feltnavn: string) => {
    if (!get().skalViseFeilmeldinger) {
      return '';
    }
    const feilmeldinger = get().feilmeldinger;

    if (!feilmeldinger || feilmeldinger.length === 0 || !feltnavn) {
      return '';
    }

    const melding: ValiderTekster | undefined = feilmeldinger.find((feilmelding) => feilmelding.felt === feltnavn);

    return melding ? melding.text : '';
  },

  visFeilmelding: (feltnavn) => {
    if (!get().skalViseFeilmeldinger) {
      return false;
    }
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
        state = slettFeilmelding(state, felt);
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
