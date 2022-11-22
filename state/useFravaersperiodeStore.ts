import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { parseISO } from 'date-fns';
import { MottattPeriode } from './MottattData';
import { Periode } from './state';
import produce from 'immer';
import { DateRange } from 'react-day-picker';
import { CompleteState } from './useBoundStore';

export interface FravaersperiodeState {
  fravaersperioder?: Array<Periode>;
  opprinneligFravaersperiode?: Array<Periode>;
  sammeFravaersperiode: boolean;
  leggTilFravaersperiode: () => void;
  slettFravaersperiode: (periodeId: string) => void;
  setFravaersperiodeDato: (periodeId: string, nyTilDato: DateRange | undefined) => void;
  tilbakestillFravaersperiode: () => void;
  endreFravaersperiode: () => void;
  initFravaersperiode: (mottatFravaersperiode: Array<MottattPeriode>) => void;
}

const useFravaersperiodeStore: StateCreator<CompleteState, [], [], FravaersperiodeState> = (set, get) => ({
  fravaersperioder: undefined,
  opprinneligFravaersperiode: undefined,
  sammeFravaersperiode: false,

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

  setFravaersperiodeDato: (periodeId: string, nyDato: DateRange | undefined) =>
    set(
      produce((state) => {
        if (state.fravaersperioder) {
          state.fravaersperioder = state.fravaersperioder.map((periode: Periode) => {
            if (periode.id === periodeId) {
              if (periode.til !== nyDato?.to || periode.fra !== nyDato?.from) {
                state.sammeFravaersperiode = false;
              }
              periode.til = nyDato?.to;
              periode.fra = nyDato?.from;
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

  endreFravaersperiode: () =>
    set(
      produce((state) => {
        state.sammeFravaersperiode = false;

        return state;
      })
    ),

  initFravaersperiode: (mottatFravaersperioder: Array<MottattPeriode>) => {
    const fravaersperioder = mottatFravaersperioder.map((periode) => ({
      fra: parseISO(periode.fra),
      til: parseISO(periode.til),
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
