import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Naturalytelse, YesNo } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface NaturalytelserState {
  naturalytelser?: Array<Naturalytelse>;
  hasBortfallAvNaturalytelser?: YesNo;
  slettAlleNaturalytelser: () => void;
  initNaturalytelser: (naturalytelser: Array<Naturalytelse>) => void;
}

const useNaturalytelserStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    EgenmeldingState &
    BruttoinntektState,
  [],
  [],
  NaturalytelserState
> = (set) => ({
  naturalytelser: undefined,
  hasBortfallAvNaturalytelser: undefined,

  slettAlleNaturalytelser: () => {
    set(
      produce((state) => {
        state.naturalytelser = undefined;

        return state;
      })
    );
  },
  initNaturalytelser: (naturalytelser) => {
    set(
      produce((state) => {
        if (!state.naturalytelser) {
          state.naturalytelser = [];
        }
        if (naturalytelser) {
          state.naturalytelser = naturalytelser.map((ytelse) => ({
            ...ytelse,
            sluttdato: parseIsoDate(ytelse.sluttdato)
          }));
        } else {
          state.naturalytelser = [];
        }

        return state;
      })
    );
  }
});

export default useNaturalytelserStore;
