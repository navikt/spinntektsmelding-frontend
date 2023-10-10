import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';

import { leggTilFeilmelding, slettFeilmeldingFraState } from './useFeilmeldingerStore';

import feiltekster from '../utils/feiltekster';
import { CompleteState } from './useBoundStore';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';

export interface RefusjonArbeidsgiverState {
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  opprinneligLonnISykefravaeret?: LonnISykefravaeret;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  opprinneligRefusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  harRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBelop>;
  opprinneligRefusjonEndringer?: Array<EndringsBelop>;
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo | undefined) => void;
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => void;
  begrunnelseRedusertUtbetaling: (begrunnelse?: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | undefined) => void;
  setBeloepUtbetaltUnderArbeidsgiverperioden: (beloep: string | undefined) => void;
  refusjonskravetOpphoererStatus: (status: YesNo) => void;
  refusjonskravetOpphoererDato: (opphoersdato?: Date) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) => void;
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBelop>) => void;
  initRefusjonEndringer: (endringer: Array<EndringsBelop>) => void;
  setHarRefusjonEndringer: (harEndringer?: YesNo) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: LonnISykefravaeret) => void;
}

const useRefusjonArbeidsgiverStore: StateCreator<CompleteState, [], [], RefusjonArbeidsgiverState> = (set, get) => ({
  fullLonnIArbeidsgiverPerioden: undefined,
  lonnISykefravaeret: undefined,
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = {};
        }

        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { status: status };
        } else state.fullLonnIArbeidsgiverPerioden.status = status;

        state = slettFeilmeldingFraState(state, 'lia-radio');
        state = slettFeilmeldingFraState(state, 'lus-uua-input');

        return state;
      })
    ),
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => {
    const bruttoinntekt = get().bruttoinntekt;

    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { status: status };
        } else state.lonnISykefravaeret.status = status;
        if (status === 'Ja') {
          state.lonnISykefravaeret.belop = bruttoinntekt.bruttoInntekt;
        } else {
          delete state.lonnISykefravaeret.belop;
        }

        state = slettFeilmeldingFraState(state, 'lus-radio');

        return state;
      })
    );
  },
  begrunnelseRedusertUtbetaling: (begrunnelse) =>
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
          state = slettFeilmeldingFraState(state, 'lia-select');
        } else {
          state = leggTilFeilmelding(state, 'lia-select', feiltekster.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE);
        }
        return state;
      })
    ),
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | undefined) =>
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { belop: stringishToNumber(beloep) };
        } else {
          state.lonnISykefravaeret.belop = stringishToNumber(beloep);
        }

        state = slettFeilmeldingFraState(state, 'lus-input');
        const nBelop = stringishToNumber(beloep);
        if (ugyldigEllerNegativtTall(nBelop)) {
          state = leggTilFeilmelding(state, 'lus-input', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }
        return state;
      })
    ),
  setBeloepUtbetaltUnderArbeidsgiverperioden: (beloep: string | undefined) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = {};
        }
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { utbetalt: stringishToNumber(beloep) };
        } else {
          state.fullLonnIArbeidsgiverPerioden.utbetalt = stringishToNumber(beloep);
        }

        const nBelop = stringishToNumber(beloep);

        state = slettFeilmeldingFraState(state, 'lus-uua-input');
        if (ugyldigEllerNegativtTall(nBelop)) {
          state = leggTilFeilmelding(state, 'lus-uua-input', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
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
          state.refusjonskravetOpphoerer = {
            status: status
          };
        }
        slettFeilmeldingFraState(state, 'lus-sluttdato-velg');
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
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBelop>) =>
    set(
      produce((state) => {
        state.refusjonEndringer = endringer;
        if (endringer?.length > 0) {
          endringer.forEach((endring, index) => {
            if (endring.belop && endring.belop >= 0) {
              slettFeilmeldingFraState(state, `refusjon.refusjonEndringer[${index}].beløp`);
            }
            if (endring.dato && endring.dato >= state.bestemmendeFravaersdag) {
              slettFeilmeldingFraState(state, `refusjon.refusjonEndringer[${index}].dato`);
            }
          });
        }
        return state;
      })
    ),
  initRefusjonEndringer: (endringer: Array<EndringsBelop>) =>
    set(
      produce((state) => {
        state.refusjonEndringer = endringer;
        state.opprinneligRefusjonEndringer = endringer;
        if (endringer?.length > 0) {
          endringer.forEach((endring, index) => {
            if (endring.belop && endring.belop >= 0) {
              slettFeilmeldingFraState(state, `refusjon.refusjonEndringer[${index}].beløp`);
            }
            if (endring.dato && endring.dato >= state.bestemmendeFravaersdag) {
              slettFeilmeldingFraState(state, `refusjon.refusjonEndringer[${index}].dato`);
            }
          });
        }
        return state;
      })
    ),
  setHarRefusjonEndringer: (harEndringer) =>
    set(
      produce((state) => {
        state.harRefusjonEndringer = harEndringer;
        if (!state.refusjonEndringer) {
          state.refusjonEndringer = [{}];
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
        state.opprinneligLonnISykefravaeret = lonnISykefravaeret;
        return state;
      })
    )
});

export default useRefusjonArbeidsgiverStore;
