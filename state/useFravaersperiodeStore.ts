import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { parseISO } from 'date-fns';
import { MottattPeriode } from './MottattData';
import { Periode } from './state';
import produce from 'immer';
import { CompleteState } from './useBoundStore';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';

export interface FravaersperiodeState {
  fravaersperioder?: Array<Periode>;
  opprinneligFravaersperiode?: Array<Periode>;
  leggTilFravaersperiode: () => void;
  slettFravaersperiode: (periodeId: string) => void;
  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) => void;
  tilbakestillFravaersperiode: () => void;
  initFravaersperiode: (mottatFravaersperiode: Array<MottattPeriode>) => void;
}

const useFravaersperiodeStore: StateCreator<CompleteState, [], [], FravaersperiodeState> = (set, get) => ({
  fravaersperioder: undefined,
  opprinneligFravaersperiode: undefined,

  leggTilFravaersperiode: () =>
    set(
      produce((state) => {
        const nyFravaersperiode: Periode = { id: nanoid() };
        if (!state.fravaersperioder) {
          state.fravaersperioder = {};
          state.fravaersperioder = [];
        }
        state.fravaersperioder.push(nyFravaersperiode);

        return state;
      })
    ),

  slettFravaersperiode: (periodeId: string) =>
    set(
      produce((state) => {
        if (state.fravaersperioder) {
          if (state.fravaersperioder) {
            const nyePerioder = state.fravaersperioder.filter((periode: Periode) => periode.id !== periodeId);
            state.fravaersperioder = nyePerioder;
          }
        }

        state.sammeFravaersperiode = false;

        return state;
      })
    ),

  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) =>
    set(
      produce((state) => {
        if (state.fravaersperioder) {
          state.fravaersperioder = state.fravaersperioder.map((periode: Periode) => {
            if (periode.id === periodeId) {
              if (periode.tom !== oppdatertPeriode?.tom || periode.fom !== oppdatertPeriode?.fom) {
                state.sammeFravaersperiode = false;
              }
              periode.tom = oppdatertPeriode?.tom;
              periode.fom = oppdatertPeriode?.fom;
            }
            return periode;
          });
        }
        return state;
      })
    ),

  tilbakestillFravaersperiode: () => {
    const tilbakestiltPeriode = get().opprinneligFravaersperiode;
    const klonetFravaersperiode = structuredClone(tilbakestiltPeriode);
    return set(
      produce((state) => {
        state.fravaersperioder = klonetFravaersperiode;

        state.sammeFravaersperiode = false;
        return state;
      })
    );
  },

  initFravaersperiode: (mottatFravaersperioder: Array<MottattPeriode>) => {
    const fravaersperioder: Array<Periode> = mottatFravaersperioder.map((periode) => ({
      fom: parseISO(periode.fom),
      tom: parseISO(periode.tom),
      id: nanoid()
    }));

    return set(
      produce((state) => {
        state.fravaersperioder = structuredClone(fravaersperioder);
        state.opprinneligFravaersperiode = structuredClone(fravaersperioder);

        return state;
      })
    );
  }
});

export default useFravaersperiodeStore;
