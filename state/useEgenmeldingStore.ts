import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattPeriode } from './MottattData';
import { DateRange } from 'react-day-picker';
import { CompleteState } from './useBoundStore';

export interface EgenmeldingState {
  egenmeldingsperioder: Array<Periode>;
  opprinneligEgenmeldingsperiode?: Array<Periode>;
  endreEgenmeldingsperiode: boolean;
  setEgenmeldingDato: (dateValue: DateRange | undefined, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: () => void;
  setEndreEgenmelding: (status: boolean) => void;
  tilbakestillEgenmelding: () => void;
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => void;
}

const useEgenmeldingStore: StateCreator<CompleteState, [], [], EgenmeldingState> = (set, get) => ({
  egenmeldingsperioder: [{ id: nanoid() }],
  endreEgenmeldingsperiode: false,
  setEgenmeldingDato: (dateValue: DateRange | undefined, periodeId: string) =>
    set(
      produce((state) => {
        state.egenmeldingsperioder = state.egenmeldingsperioder.map((periode: Periode) => {
          if (periode.id === periodeId) {
            periode.tom = dateValue?.to;
            periode.fom = dateValue?.from;
            return periode;
          }
          return periode;
        });

        return state;
      })
    ),
  slettEgenmeldingsperiode: (periodeId: string) =>
    set(
      produce((state) => {
        const nyePerioder = state.egenmeldingsperioder.filter((periode: Periode) => periode.id !== periodeId);
        state.egenmeldingsperioder = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;

        return state;
      })
    ),
  leggTilEgenmeldingsperiode: () =>
    set(
      produce((state) => {
        const nyEgenmeldingsperiode: Periode = { id: nanoid() };

        if (state.egenmeldingsperioder) {
          state.egenmeldingsperioder.push(nyEgenmeldingsperiode);
        } else {
          state.egenmeldingsperioder = [nyEgenmeldingsperiode];
        }

        return state;
      })
    ),

  setEndreEgenmelding: (status: boolean) => {
    set(
      produce((state) => {
        state.endreEgenmeldingsperiode = status;

        return state;
      })
    );
  },
  tilbakestillEgenmelding: () => {
    const clonedEgenmelding = structuredClone(get().opprinneligEgenmeldingsperiode);

    set(
      produce((state) => {
        if (clonedEgenmelding) {
          state.egenmeldingsperioder = structuredClone(clonedEgenmelding);
        }

        return state;
      })
    );
  },
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => {
    set(
      produce((state) => {
        state.egenmeldingsperioder = {};

        state.endreEgenmeldingsperiode = false;

        if (egenmeldingsperioder) {
          state.egenmeldingsperioder = egenmeldingsperioder.map((periode) => ({
            fom: parseIsoDate(periode.fom),
            tom: parseIsoDate(periode.tom),
            id: nanoid()
          }));
        } else {
          state.egenmeldingsperioder = [{ id: nanoid() }];
          state.endreEgenmeldingsperiode = true;
        }

        state.opprinneligEgenmeldingsperiode = structuredClone(state.egenmeldingsperioder);
        return state;
      })
    );
  }
});

export default useEgenmeldingStore;
