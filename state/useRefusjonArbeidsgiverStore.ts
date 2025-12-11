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
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo, bruttoinntekt: number) => void;
  begrunnelseRedusertUtbetaling: (begrunnelse?: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | number | undefined) => void;
  setBeloepUtbetaltUnderArbeidsgiverperioden: (beloep: string | undefined) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) => void;
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  initRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  setHarRefusjonEndringer: (harEndringer?: YesNo) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: LonnISykefravaeret) => void;
  tilbakestillRefusjoner: () => void;
  slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: () => void;
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
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo, bruttoinntekt: number) => {
    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { status: status };
        } else state.lonnISykefravaeret.status = status;
        if (status === 'Ja') {
          state.lonnISykefravaeret.beloep = bruttoinntekt;
        } else {
          delete state.lonnISykefravaeret.beloep;
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
  setBeloepUtbetaltUnderArbeidsgiverperioden: (beloep: string | undefined) =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { utbetalt: stringishToNumber(beloep) };
        } else {
          state.fullLonnIArbeidsgiverPerioden.utbetalt = stringishToNumber(beloep);
        }

        const nBeloep = stringishToNumber(beloep);

        state = slettFeilmeldingFraState(state, 'agp.redusertLoennIAgp.beloep');
        if (ugyldigEllerNegativtTall(nBeloep)) {
          state = leggTilFeilmelding(state, 'agp.redusertLoennIAgp.beloep', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }
        return state;
      })
    ),
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBeloep>) =>
    set(
      produce((state) => {
        state.refusjonEndringer = endringer;
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
  setHarRefusjonEndringer: (harEndringer) =>
    set(
      produce((state) => {
        state.harRefusjonEndringer = harEndringer;
        if (!state.refusjonEndringer) {
          state.refusjonEndringer = [{}];
        }

        state.opprinneligHarRefusjonEndringer ??= harEndringer;

        state.opprinneligRefusjonEndringer ??= [{}];

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
  tilbakestillRefusjoner: () =>
    set(
      produce((state) => {
        state.refusjonEndringer = state.opprinneligRefusjonEndringer;
        state.lonnISykefravaeret = state.opprinneligLonnISykefravaeret;
        state.fullLonnIArbeidsgiverPerioden = undefined;

        state.opprinneligRefusjonEndringer.forEach((_, index: number) => {
          slettFeilmeldingFraState(state, `#refusjon.refusjonEndringer[${index}].beløp`);
          slettFeilmeldingFraState(state, `#refusjon.refusjonEndringer[${index}].dato`);
        });
        return state;
      })
    ),
  slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: () =>
    set(
      produce((state) => {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = { status: undefined };
        } else state.fullLonnIArbeidsgiverPerioden.status = undefined;

        state = slettFeilmeldingFraState(state, 'lia-radio');
        state = slettFeilmeldingFraState(state, 'agp.redusertLoennIAgp.beloep');

        return state;
      })
    )
});

export default useRefusjonArbeidsgiverStore;
