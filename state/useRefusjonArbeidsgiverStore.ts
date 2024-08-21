import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from './state';
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
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  opprinneligRefusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  harRefusjonEndringer?: YesNo;
  opprinneligHarRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBeloep>;
  opprinneligRefusjonEndringer?: Array<EndringsBeloep>;
  arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (status: YesNo | undefined) => void;
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => void;
  begrunnelseRedusertUtbetaling: (begrunnelse?: string) => void;
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | undefined) => void;
  setBeloepUtbetaltUnderArbeidsgiverperioden: (beloep: string | undefined) => void;
  refusjonskravetOpphoererStatus: (status: YesNo) => void;
  refusjonskravetOpphoererDato: (opphoersdato?: Date) => void;
  initFullLonnIArbeidsgiverPerioden: (lonnIArbeidsgiverperioden: LonnIArbeidsgiverperioden) => void;
  oppdaterRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  initRefusjonEndringer: (endringer: Array<EndringsBeloep>) => void;
  setHarRefusjonEndringer: (harEndringer?: YesNo) => void;
  initLonnISykefravaeret: (lonnISykefravaeret: LonnISykefravaeret) => void;
  initRefusjonskravetOpphoerer: (status: YesNo | undefined, opphoersdato?: Date, harEndringer?: YesNo) => void;
  tilbakestillRefusjoner: () => void;
  slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: () => void;
}

const useRefusjonArbeidsgiverStore: StateCreator<CompleteState, [], [], RefusjonArbeidsgiverState> = (set, get) => ({
  fullLonnIArbeidsgiverPerioden: undefined,
  lonnISykefravaeret: undefined,
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
  arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: (status: YesNo) => {
    const bruttoinntekt = get().bruttoinntekt;

    set(
      produce((state) => {
        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { status: status };
        } else state.lonnISykefravaeret.status = status;
        if (status === 'Ja') {
          state.lonnISykefravaeret.beloep = bruttoinntekt.bruttoInntekt;
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
  beloepArbeidsgiverBetalerISykefravaeret: (beloep: string | undefined) =>
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
          state.refusjonskravetOpphoerer.opphoersdato = opphoersdato;
        } else {
          if (!state.refusjonskravetOpphoerer) {
            state.refusjonskravetOpphoerer = {};
          }
          state.refusjonskravetOpphoerer = {
            opphoersdato: opphoersdato
          };
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
  initRefusjonskravetOpphoerer: (status, opphoersdato, harEndringer) =>
    set(
      produce((state) => {
        state.refusjonskravetOpphoerer = { status: status, opphoersdato: opphoersdato };
        state.opprinneligRefusjonskravetOpphoerer = { status: status, opphoersdato: opphoersdato };
        state.harRefusjonEndringer = harEndringer;
        state.opprinneligHarRefusjonEndringer = harEndringer;
        return state;
      })
    ),
  tilbakestillRefusjoner: () =>
    set(
      produce((state) => {
        state.refusjonEndringer = state.opprinneligRefusjonEndringer;
        state.lonnISykefravaeret = state.opprinneligLonnISykefravaeret;
        state.fullLonnIArbeidsgiverPerioden = undefined;
        state.refusjonskravetOpphoerer = state.opprinneligRefusjonskravetOpphoerer;

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
          state.fullLonnIArbeidsgiverPerioden = {};
        }

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
