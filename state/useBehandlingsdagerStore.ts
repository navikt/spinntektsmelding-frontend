import { StateCreator } from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import { MottattPeriode } from './MottattData';
import parseIsoDate from '../utils/parseIsoDate';
import { nanoid } from 'nanoid';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface BehandlingsdagerState {
  behandlingsperiode?: Periode;
  behandlingsdager?: Array<Date>;
  setBehandlingsdager: (behandlingsdatoer: Array<Date> | undefined) => void;
  initBehandlingsdager: (behandlingsperiode: MottattPeriode, behandlingsdager?: Array<string>) => void;
}

const useBehandlingsdagerStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    FeilmeldingerState &
    BehandlingsdagerState &
    ArbeidsforholdState &
    BruttoinntektState &
    EgenmeldingState,
  [],
  [],
  BehandlingsdagerState
> = (set) => ({
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
          fra: parseIsoDate(behandlingsperiode.fra),
          til: parseIsoDate(behandlingsperiode.til),
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
