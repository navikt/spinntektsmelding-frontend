import create from 'zustand';
import produce from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import parseIsoDate from '../utils/parseIsoDate';

interface RefusjonArbeidsgiverState {
  fullLonnIArbeidsgiverPerioden?: { [key: string]: LonnIArbeidsgiverperioden };
  lonnISykefravaeret?: { [key: string]: LonnISykefravaeret };
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer };
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (arbeidsforholdId: string, status: YesNo) => void;
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (arbeidsforholdId: string, status: YesNo) => void;
  begrunnelseRedusertUtbetaling: (arbeidsforholdId: string, begrunnelse: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (arbeidsforholdId: string, beloep: string) => void;
  refusjonskravetOpphoererStatus: (arbeidsforholdId: string, status: YesNo) => void;
  refusjonskravetOpphoererDato: (arbeidsforholdId: string, isoDato: string) => void;
  initFullLonnIArbeidsgiverPerioden: () => void;
  initLonnISykefravaeret: () => void;
}

const useRefusjonArbeidsgiverStore = create<RefusjonArbeidsgiverState>((set) => ({
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
  refusjonskravetOpphoererDato: (arbeidsforholdId: string, isoDato: string) =>
    set(
      produce((state) => {
        if (state.refusjonskravetOpphoerer?.[arbeidsforholdId]) {
          state.refusjonskravetOpphoerer[arbeidsforholdId].opphorsdato = parseIsoDate(isoDato);
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer[arbeidsforholdId] = {
            opphorsdato: parseIsoDate(isoDato)
          };
        }

        return state;
      })
    ),
  initFullLonnIArbeidsgiverPerioden: () => set(produce((state) => {})),
  initLonnISykefravaeret: () => set(produce((state) => {}))
}));

export default useRefusjonArbeidsgiverStore;
