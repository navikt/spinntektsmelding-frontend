import create from 'zustand';
import produce from 'immer';
import { Naturalytelse, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import parseIsoDate from '../utils/parseIsoDate';
import { nanoid } from 'nanoid';

interface NaturalytelserState {
  naturalytelser?: Array<Naturalytelse>;
  hasBortfallAvNaturalytelser?: YesNo;
  setNaturalytelseType: (naturalytelseId: string, isoDato: string) => void;
  setNaturalytelseBortfallsdato: (naturalytelseId: string, isoDato: string) => void;
  setNaturalytelseVerdi: (naturalytelseId: string, verdi: string) => void;
  slettNaturalytelse: (naturalytelseId: string) => void;
  slettAlleNaturalytelser: () => void;
  leggTilNaturalytelse: () => void;
  initNaturalytelser: () => void;
}

const useNaturalytelserStore = create<NaturalytelserState>((set, get) => ({
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
  setNaturalytelseBortfallsdato: (naturalytelseId: string, isoDato: string) => {
    set(
      produce((state) => {
        state.naturalytelser = state.naturalytelser?.map((ytelse: Naturalytelse) => {
          if (ytelse.id === naturalytelseId) {
            ytelse.bortfallsdato = parseIsoDate(isoDato);
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
  initNaturalytelser: () => {}
}));

export default useNaturalytelserStore;
