import { StateCreator } from 'zustand';
import produce from 'immer';
import { HistoriskInntekt, Inntekt, Periode } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import { MottattHistoriskInntekt } from './MottattData';
import feiltekster from '../utils/feiltekster';
import { leggTilFeilmelding, slettFeilmelding } from './useFeilmeldingerStore';
import { CompleteState } from './useBoundStore';
import { subMonths } from 'date-fns';

export const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maanedsnavn < b.maanedsnavn) {
    return 1;
  } else {
    return -1;
  }
};

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  opprinneligeInntekt?: Array<HistoriskInntekt>;
  ferie?: Array<Periode>;
  lonnsendringsdato?: Date;
  tariffendringsdato?: Date;
  tariffkjentdato?: Date;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  permisjon?: Array<Periode>;
  permitering?: Array<Periode>;
  setNyMaanedsinntekt: (belop: string) => void;
  setNyMaanedsinntektBlanktSkjema: (belop: string) => void;
  setEndringsaarsak: (aarsak: string) => void;
  setFeriePeriode: (periode: Array<Periode> | undefined) => void;
  setLonnsendringDato: (endringsdato?: Date) => void;
  setTariffEndringsdato: (endringsdato?: Date) => void;
  setTariffKjentdato: (kjentFraDato?: Date) => void;
  setNyStillingDato: (dato?: Date) => void;
  setNyStillingsprosentDato: (dato?: Date) => void;
  setPermisjonPeriode: (periode: Array<Periode> | undefined) => void;
  setPermiteringPeriode: (periode: Array<Periode> | undefined) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean, reset?: boolean) => void;
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<MottattHistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => void;
  rekalkulerBruttioinntekt: (bestemmendeFravaersdag: Date) => void;
}

const useBruttoinntektStore: StateCreator<CompleteState, [], [], BruttoinntektState> = (set, get) => ({
  bruttoinntekt: {
    bruttoInntekt: undefined,
    bekreftet: true,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: undefined,
    bekreftet: true,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  tidligereInntekt: undefined,
  setNyMaanedsinntekt: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;
        if (state.bruttoinntekt.bruttoInntekt != undefined && state.bruttoinntekt.bruttoInntekt >= 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),
  setNyMaanedsinntektBlanktSkjema: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = false;
        state.bruttoinntekt.bekreftet = true;
        if (state.bruttoinntekt.bruttoInntekt !== undefined && state.bruttoinntekt.bruttoInntekt >= 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),

  setEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        state.bruttoinntekt.manueltKorrigert = true;

        if (aarsak && aarsak !== '') {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsaarsak');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsaarsak', feiltekster.ENDRINGSAARSAK_MANGLER);
        }

        return state;
      })
    ),
  setFeriePeriode: (periode) =>
    set(
      produce((state) => {
        state.ferie = periode;
        return state;
      })
    ),
  setLonnsendringDato: (endringsdato) =>
    set(
      produce((state) => {
        state.lonnsendringsdato = endringsdato;

        return state;
      })
    ),
  setTariffEndringsdato: (endringsdato?: Date) =>
    set(
      produce((state) => {
        state.tariffendringsdato = endringsdato;

        return state;
      })
    ),
  setTariffKjentdato: (kjentFraDato?: Date) =>
    set(
      produce((state) => {
        state.tariffkjentdato = kjentFraDato;

        return state;
      })
    ),
  setNyStillingsprosentDato: (dato) =>
    set(
      produce((state) => {
        state.nystillingsprosentdato = dato;

        return state;
      })
    ),
  setNyStillingDato: (dato) =>
    set(
      produce((state) => {
        state.nystillingdato = dato;

        return state;
      })
    ),
  setPermisjonPeriode: (periode) =>
    set(
      produce((state) => {
        state.permisjon = periode;
        return state;
      })
    ),
  setPermiteringPeriode: (periode) =>
    set(
      produce((state) => {
        state.permitering = periode;
        return state;
      })
    ),
  tilbakestillMaanedsinntekt: () =>
    set(
      produce((state) => {
        state.bruttoinntekt = { ...state.opprinneligbruttoinntekt };
        return state;
      })
    ),
  bekreftKorrektInntekt: (bekreftet, reset) =>
    set(
      produce((state) => {
        state.bruttoinntekt!.bekreftet = true;
        if (bekreftet === true) {
          state = slettFeilmelding(state, 'bruttoinntektbekreft');
        }

        return state;
      })
    ),
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<MottattHistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => {
    const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const sumInntekter = aktuelleInntekter.reduce(
      (prev, cur) => {
        prev.inntekt += cur.inntekt;
        return prev;
      },
      { inntekt: 0, maanedsnavn: '' }
    );

    const snittInntekter = sumInntekter.inntekt / aktuelleInntekter.length;

    set(
      produce((state) => {
        state.bruttoinntekt = {
          bruttoInntekt: snittInntekter,
          bekreftet: true,
          manueltKorrigert: false,
          endringsaarsak: ''
        };
        state.opprinneligbruttoinntekt = {
          bruttoInntekt: snittInntekter,
          bekreftet: true,
          manueltKorrigert: false,
          endringsaarsak: ''
        };

        state.opprinneligeInntekt = tidligereInntekt;

        if (aktuelleInntekter) {
          state.tidligereInntekt = aktuelleInntekter.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt
          }));
        }

        return state;
      })
    );
  },
  rekalkulerBruttioinntekt: (bestemmendeFravaersdag: Date) => {
    const tidligereInntekt = get().opprinneligeInntekt;
    const bruttoinntekt = get().bruttoinntekt;

    if (!tidligereInntekt) return false;

    const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);

    const sumInntekter = aktuelleInntekter.reduce(
      (prev, cur) => {
        prev.inntekt += cur.inntekt;
        return prev;
      },
      { inntekt: 0, maanedsnavn: '' }
    );

    const snittInntekter = sumInntekter.inntekt / aktuelleInntekter.length;

    set(
      produce((state) => {
        if (!bruttoinntekt.bekreftet && !bruttoinntekt.manueltKorrigert) {
          state.bruttoinntekt = {
            bruttoInntekt: snittInntekter,
            bekreftet: false,
            manueltKorrigert: false,
            endringsaarsak: ''
          };
        }

        if (aktuelleInntekter) {
          state.tidligereInntekt = aktuelleInntekter.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt
          }));
        }

        return state;
      })
    );
  }
});

export default useBruttoinntektStore;

export function finnAktuelleInntekter(tidligereInntekt: HistoriskInntekt[], bestemmendeFravaersdag: Date) {
  const bestMnd = `00${bestemmendeFravaersdag.getMonth() + 1}`.slice(-2);
  const bestemmendeMaaned = `${bestemmendeFravaersdag.getFullYear()}-${bestMnd}`;
  const sisteMnd = `00${subMonths(bestemmendeFravaersdag, 3).getMonth() + 1}`.slice(-2);
  const sisteMaaned = `${subMonths(bestemmendeFravaersdag, 3).getFullYear()}-${sisteMnd}`;

  if (!tidligereInntekt) return [];
  const aktuelleInntekter = tidligereInntekt
    .filter((inntekt) => inntekt.maanedsnavn < bestemmendeMaaned && inntekt.maanedsnavn >= sisteMaaned)
    .sort(sorterInntekter)
    .slice(0, 3);

  return aktuelleInntekter || [];
}
