import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Naturalytelse, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import parseIsoDate from '../utils/parseIsoDate';
import { nanoid } from 'nanoid';
import { MottattNaturalytelse } from './MottattData';
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface NaturalytelserState {
  naturalytelser?: Array<Naturalytelse>;
  hasBortfallAvNaturalytelser?: YesNo;
  setNaturalytelseType: (naturalytelseId: string, type: string) => void;
  setNaturalytelseBortfallsdato: (naturalytelseId: string, dato?: Date) => void;
  setNaturalytelseVerdi: (naturalytelseId: string, verdi: string) => void;
  slettNaturalytelse: (naturalytelseId: string) => void;
  slettAlleNaturalytelser: () => void;
  leggTilNaturalytelse: () => void;
  initNaturalytelser: (naturalytelser: Array<MottattNaturalytelse>) => void;
}

const useNaturalytelserStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    EgenmeldingState &
    BruttoinntektState &
    BehandlingsdagerState,
  [],
  [],
  NaturalytelserState
> = (set) => ({
  naturalytelser: undefined,
  hasBortfallAvNaturalytelser: undefined,
  setNaturalytelseType: (naturalytelseId: string, type: string) => {
    set(
      produce((state) => {
        state.naturalytelser = state.naturalytelser?.map((ytelse: Naturalytelse) => {
          if (ytelse.id === naturalytelseId) {
            const oppdatertYtelse: Naturalytelse = ytelse;
            oppdatertYtelse.type = type;
            return oppdatertYtelse;
          }

          return ytelse;
        });
        return state;
      })
    );
  },
  setNaturalytelseBortfallsdato: (naturalytelseId: string, dato?: Date) => {
    set(
      produce((state) => {
        state.naturalytelser = state.naturalytelser?.map((ytelse: Naturalytelse) => {
          if (ytelse.id === naturalytelseId) {
            ytelse.bortfallsdato = dato;
          }

          return ytelse;
        });
        return state;
      })
    );
  },
  setNaturalytelseVerdi: (naturalytelseId: string, verdi: string) => {
    set(
      produce((state) => {
        state.naturalytelser = state.naturalytelser?.map((ytelse: Naturalytelse) => {
          if (ytelse.id === naturalytelseId) {
            ytelse.verdi = stringishToNumber(verdi);
          }

          return ytelse;
        });
        return state;
      })
    );
  },
  slettNaturalytelse: (naturalytelseId: string) => {
    set(
      produce((state) => {
        const nyeNaturalytelser = state.naturalytelser?.filter(
          (element: Naturalytelse) => element.id !== naturalytelseId
        );
        state.naturalytelser = nyeNaturalytelser;

        return state;
      })
    );
  },
  leggTilNaturalytelse: () => {
    set(
      produce((state) => {
        const nyNaturalytelseRad: Naturalytelse = {
          id: nanoid()
        };

        if (!state.naturalytelser) {
          state.naturalytelser = [];
        }

        state.naturalytelser.push(nyNaturalytelseRad);

        return state;
      })
    );
  },
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

        state.naturalytelser = naturalytelser.map((ytelse) => ({
          ...ytelse,
          bortfallsdato: parseIsoDate(ytelse.bortfallsdato),
          id: nanoid()
        }));
        console.log('state.naturalytelser', state.naturalytelser);
        return state;
      })
    );
  }
});

export default useNaturalytelserStore;
