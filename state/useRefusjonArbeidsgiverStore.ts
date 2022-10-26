import { StateCreator } from 'zustand';
import produce from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import parseIsoDate from '../utils/parseIsoDate';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { PersonState } from './usePersonStore';
import { NaturalytelserState } from './useNaturalytelserStore';
import { FeilmeldingerState, leggTilFeilmelding, slettFeilmelding } from './useFeilmeldingerStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import feiltekster from '../utils/feiltekster';

export interface RefusjonArbeidsgiverState {
  fullLonnIArbeidsgiverPerioden?: { [key: string]: LonnIArbeidsgiverperioden };
  lonnISykefravaeret?: { [key: string]: LonnISykefravaeret };
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer };
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (arbeidsforholdId: string, status: YesNo) => void;
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (arbeidsforholdId: string, status: YesNo) => void;
  begrunnelseRedusertUtbetaling: (arbeidsforholdId: string, begrunnelse: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (arbeidsforholdId: string, beloep: string) => void;
  refusjonskravetOpphoererStatus: (arbeidsforholdId: string, status: YesNo) => void;
  refusjonskravetOpphoererDato: (arbeidsforholdId: string, opphoersdato?: Date) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: { [key: string]: LonnIArbeidsgiverperioden }) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: { [key: string]: LonnISykefravaeret }) => void;
}

const useRefusjonArbeidsgiverStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    BruttoinntektState &
    ArbeidsforholdState &
    BehandlingsdagerState &
    EgenmeldingState,
  [],
  [],
  RefusjonArbeidsgiverState
> = (set) => ({
  fullLonnIArbeidsgiverPerioden: undefined,
  lonnISykefravaeret: undefined,
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (arbeidsforholdId: string, status: YesNo) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = {};
        }

        if (!state.fullLonnIArbeidsgiverPerioden[arbeidsforholdId]) {
          state.fullLonnIArbeidsgiverPerioden[arbeidsforholdId] = { status: status };
        } else state.fullLonnIArbeidsgiverPerioden[arbeidsforholdId].status = status;

        state = slettFeilmelding(state, `lia-radio-${arbeidsforholdId}`);

        return state;
      })
    ),
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (arbeidsforholdId: string, status: YesNo) =>
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = {};
        }

        if (!state.lonnISykefravaeret[arbeidsforholdId]) {
          state.lonnISykefravaeret[arbeidsforholdId] = { status: status };
        } else state.lonnISykefravaeret[arbeidsforholdId].status = status;

        state = slettFeilmelding(state, `lus-radio-${arbeidsforholdId}`);

        return state;
      })
    ),
  begrunnelseRedusertUtbetaling: (arbeidsforholdId: string, begrunnelse: string) =>
    set(
      produce((state) => {
        if (state.fullLonnIArbeidsgiverPerioden?.[arbeidsforholdId]) {
          state.fullLonnIArbeidsgiverPerioden[arbeidsforholdId].begrunnelse = begrunnelse;
        } else {
          if (!state.fullLonnIArbeidsgiverPerioden) {
            state.fullLonnIArbeidsgiverPerioden = {};
          }
          state.fullLonnIArbeidsgiverPerioden[arbeidsforholdId] = { begrunnelse: begrunnelse };
        }
        if (begrunnelse && begrunnelse.length > 0) {
          state = slettFeilmelding(state, `lia-select-${arbeidsforholdId}`);
        } else {
          state = leggTilFeilmelding(
            state,
            `lia-select-${arbeidsforholdId}`,
            feiltekster.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE
          );
        }
        return state;
      })
    ),
  beloepArbeidsgiverBetalerISykefravaeret: (arbeidsforholdId: string, beloep: string) =>
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = {};
        }
        if (!state.lonnISykefravaeret[arbeidsforholdId]) {
          state.lonnISykefravaeret[arbeidsforholdId] = { belop: stringishToNumber(beloep) };
        } else {
          state.lonnISykefravaeret[arbeidsforholdId].belop = stringishToNumber(beloep);
        }

        if (beloep && stringishToNumber(beloep)! >= 0) {
          state = slettFeilmelding(state, `lus-input-${arbeidsforholdId}`);
        } else {
          state = leggTilFeilmelding(
            state,
            `lus-input-${arbeidsforholdId}`,
            feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP
          );
        }
        return state;
      })
    ),
  refusjonskravetOpphoererStatus: (arbeidsforholdId: string, status: YesNo) =>
    set(
      produce((state) => {
        if (state.refusjonskravetOpphoerer?.[arbeidsforholdId]) {
          state.refusjonskravetOpphoerer[arbeidsforholdId].status = status;
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer[arbeidsforholdId] = {
            status: status
          };
        }
        return state;
      })
    ),
  refusjonskravetOpphoererDato: (arbeidsforholdId: string, opphoersdato?: Date) =>
    set(
      produce((state) => {
        if (state.refusjonskravetOpphoerer?.[arbeidsforholdId]) {
          state.refusjonskravetOpphoerer[arbeidsforholdId].opphorsdato = opphoersdato;
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer[arbeidsforholdId] = {
            opphorsdato: opphoersdato
          };
        }

        return state;
      })
    ),
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: { [key: string]: LonnIArbeidsgiverperioden }) =>
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
