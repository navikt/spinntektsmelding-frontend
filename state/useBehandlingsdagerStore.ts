import { StateCreator } from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import { MottattPeriode } from './MottattData';
import parseIsoDate from '../utils/parseIsoDate';
import { nanoid } from 'nanoid';
import { CompleteState } from './useBoundStore';

export interface BehandlingsdagerState {
  behandlingsperiode?: Periode;
  behandlingsdager?: Array<Date>;
  setBehandlingsdager: (behandlingsdatoer: Array<Date> | undefined) => void;
  initBehandlingsdager: (behandlingsperiode: MottattPeriode, behandlingsdager?: Array<string>) => void;
}

const useBehandlingsdagerStore: StateCreator<CompleteState, [], [], BehandlingsdagerState> = (set) => ({
  behandlingsperiode: undefined,
  behandlingsdager: undefined,
  setBehandlingsdager: (behandlingsdatoer) =>
    set(
      produce((state) => {
        state.behandlingsdager = behandlingsdatoer;

        return state;
      })
    ),
  initBehandlingsdager: (behandlingsperiode, behandlingsdager) =>
    set(
      produce((state) => {
        state.behandlingsperiode = {
          fom: parseIsoDate(behandlingsperiode.fom),
          tom: parseIsoDate(behandlingsperiode.tom),
          id: nanoid()
        };
        if (behandlingsdager) {
          state.behandlingsdager = behandlingsdager.map((behandlingsdag) => parseIsoDate(behandlingsdag));
        }

        return state;
      })
    )
});

export default useBehandlingsdagerStore;
