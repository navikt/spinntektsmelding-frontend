import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, YesNo } from './state';
import stringishToNumber from '../utils/stringishToNumber';

import { leggTilFeilmelding, slettFeilmeldingFraState } from './useFeilmeldingerStore';

import feiltekster from '../utils/feiltekster';
import { CompleteState } from './useBoundStore';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';

export interface RefusjonArbeidsgiverState {
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  opprinneligLonnISykefravaeret?: LonnISykefravaeret;
  harRefusjonEndringer?: YesNo;
  opprinneligHarRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBeloep>;
  opprinneligRefusjonEndringer?: Array<EndringsBeloep>;
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo | undefined) => void;
  begrunnelseRedusertUtbetaling: (begrunnelse?: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | number | undefined) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) => void;
  initRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: LonnISykefravaeret) => void;
  slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: () => void;
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  setHarRefusjonEndringer: (harEndringer: YesNo) => void;
}

const useRefusjonArbeidsgiverStore: StateCreator<CompleteState, [], [], RefusjonArbeidsgiverState> = (set, get) => ({
  fullLonnIArbeidsgiverPerioden: undefined,
  lonnISykefravaeret: undefined,
  refusjonskravetOpphoerer: { status: 'Nei' },
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo | undefined) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { status: status };
        } else if (status !== undefined) {
          state.fullLonnIArbeidsgiverPerioden.status = status;
        }
        state = slettFeilmeldingFraState(state, 'lia-radio');
        state = slettFeilmeldingFraState(state, 'agp.redusertLoennIAgp.beloep');

        return state;
      })
    ),
  begrunnelseRedusertUtbetaling: (begrunnelse) =>
    set(
      produce((state) => {
        if (state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden.begrunnelse = begrunnelse;
        } else {
          state.fullLonnIArbeidsgiverPerioden = { begrunnelse: begrunnelse };
        }
        if (begrunnelse && begrunnelse.length > 0) {
          state = slettFeilmeldingFraState(state, 'agp.redusertLoennIAgp.begrunnelse');
        } else {
          state = leggTilFeilmelding(
            state,
            'agp.redusertLoennIAgp.begrunnelse',
            feiltekster.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE
          );
        }
        return state;
      })
    ),
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | number | undefined) =>
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { beloep: stringishToNumber(beloep) };
        } else {
          state.lonnISykefravaeret.beloep = stringishToNumber(beloep);
        }

        state = slettFeilmeldingFraState(state, 'refusjon.beloepPerMaaned');
        const nBeloep = stringishToNumber(beloep);
        if (ugyldigEllerNegativtTall(nBeloep)) {
          state = leggTilFeilmelding(state, 'refusjon.beloepPerMaaned', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }
        return state;
      })
    ),
  initRefusjonEndringer: (endringer: Array<EndringsBeloep>) =>
    set(
      produce((state) => {
        state.refusjonEndringer = endringer;
        state.opprinneligRefusjonEndringer = endringer;
        if (endringer?.length > 0) {
          endringer.forEach((endring, index) => {
            if (endring.beloep && endring.beloep >= 0) {
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
    ),
  slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: () =>
    set(
      produce((state) => {
        if (state.fullLonnIArbeidsgiverPerioden) state.fullLonnIArbeidsgiverPerioden.status = undefined;
        else {
          state.fullLonnIArbeidsgiverPerioden = { status: undefined };
        }

        state = slettFeilmeldingFraState(state, 'lia-radio');
        state = slettFeilmeldingFraState(state, 'agp.redusertLoennIAgp.beloep');

        return state;
      })
    ),
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBeloep>) =>
    set(
      produce((state) => {
        state.refusjonEndringer = endringer;
        return state;
      })
    ),
  setHarRefusjonEndringer: (harEndringer: YesNo) =>
    set(
      produce((state) => {
        if (!state.harRefusjonEndringer) {
          state.opprinneligHarRefusjonEndringer = harEndringer;
        }
        state.harRefusjonEndringer = harEndringer;
        if (harEndringer === 'Ja' && (!state.refusjonEndringer || state.refusjonEndringer.length === 0)) {
          state.refusjonEndringer = [{}];
        }
        return state;
      })
    )
});

export default useRefusjonArbeidsgiverStore;
