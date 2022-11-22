import { StateCreator } from 'zustand';
import produce from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';

import { leggTilFeilmelding, slettFeilmelding } from './useFeilmeldingerStore';

import feiltekster from '../utils/feiltekster';
import { CompleteState } from './useBoundStore';

export interface RefusjonArbeidsgiverState {
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo) => void;
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => void;
  begrunnelseRedusertUtbetaling: (begrunnelse: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string) => void;
  refusjonskravetOpphoererStatus: (status: YesNo) => void;
  refusjonskravetOpphoererDato: (opphoersdato?: Date) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: LonnISykefravaeret) => void;
}

const useRefusjonArbeidsgiverStore: StateCreator<CompleteState, [], [], RefusjonArbeidsgiverState> = (set, get) => ({
  fullLonnIArbeidsgiverPerioden: undefined,
  lonnISykefravaeret: undefined,
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = {};
        }

        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { status: status };
        } else state.fullLonnIArbeidsgiverPerioden.status = status;

        state = slettFeilmelding(state, 'lia-radio');

        return state;
      })
    ),
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => {
    const bruttoinntekt = get().bruttoinntekt;
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = {};
        }

        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { status: status };
        } else state.lonnISykefravaeret.status = status;
        if (status === 'Ja') {
          state.lonnISykefravaeret.belop = bruttoinntekt.bruttoInntekt;
        } else {
          delete state.lonnISykefravaeret.belop;
        }

        state = slettFeilmelding(state, 'lus-radio');

        return state;
      })
    );
  },
  begrunnelseRedusertUtbetaling: (begrunnelse: string) =>
    set(
      produce((state) => {
        if (state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden.begrunnelse = begrunnelse;
        } else {
          if (!state.fullLonnIArbeidsgiverPerioden) {
            state.fullLonnIArbeidsgiverPerioden = {};
          }
          state.fullLonnIArbeidsgiverPerioden = { begrunnelse: begrunnelse };
        }
        if (begrunnelse && begrunnelse.length > 0) {
          state = slettFeilmelding(state, 'lia-select');
        } else {
          state = leggTilFeilmelding(state, 'lia-select', feiltekster.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE);
        }
        return state;
      })
    ),
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string) =>
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = {};
        }
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { belop: stringishToNumber(beloep) };
        } else {
          state.lonnISykefravaeret.belop = stringishToNumber(beloep);
        }

        if (beloep && stringishToNumber(beloep)! >= 0) {
          state = slettFeilmelding(state, 'lus-input');
        } else {
          state = leggTilFeilmelding(state, 'lus-input', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }
        return state;
      })
    ),
  refusjonskravetOpphoererStatus: (status: YesNo) =>
    set(
      produce((state) => {
        if (state.refusjonskravetOpphoerer) {
          state.refusjonskravetOpphoerer.status = status;
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer = {
            status: status
          };
        }
        return state;
      })
    ),
  refusjonskravetOpphoererDato: (opphoersdato?: Date) =>
    set(
      produce((state) => {
        if (state.refusjonskravetOpphoerer) {
          state.refusjonskravetOpphoerer.opphorsdato = opphoersdato;
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer = {
            opphorsdato: opphoersdato
          };
        }

        return state;
      })
    ),
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) =>
    set(
      produce((state) => {
        state.fullLonnIArbeidsgiverPerioden = lonnIArbeidsgiverperioden;

        return state;
      })
    ),
  initLonnISykefravaeret: (lonnISykefravaeret) =>
    set(
      produce((state) => {
        state.lonnISykefravaeret = lonnISykefravaeret;

        return state;
      })
    )
});

export default useRefusjonArbeidsgiverStore;
