import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { HistoriskInntekt, Inntekt, Periode } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import feiltekster from '../utils/feiltekster';
import { leggTilFeilmelding, slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { CompleteState } from './useBoundStore';
import { subMonths, startOfMonth } from 'date-fns';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import environment from '../config/environment';
import roundTwoDecimals from '../utils/roundTwoDecimals';
import { FeilReportElement } from './useStateInit';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import Router from 'next/router';

export const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maaned < b.maaned) {
    return 1;
  } else if (a.maaned > b.maaned) {
    return -1;
  }

  return 0;
};

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  opprinneligeInntekt?: Array<HistoriskInntekt>;
  ferie?: Array<Periode>;
  lonnsendringsdato?: Date;
  tariffendringDato?: Date;
  tariffkjentdato?: Date;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  permisjon?: Array<Periode>;
  sykefravaerperioder?: Array<Periode>;
  permittering?: Array<Periode>;
  sisteLonnshentedato?: Date;
  henterData: boolean;
  feilHentingAvInntektsdata?: Array<FeilReportElement>;
  setNyMaanedsinntekt: (beloep: string) => void;
  setNyMaanedsinntektBlanktSkjema: (beloep: string | number) => void;
  setOpprinneligNyMaanedsinntekt: () => void;
  setEndringsaarsak: (aarsak: string) => void;
  setFeriePeriode: (periode: Array<Periode> | undefined) => void;
  setLonnsendringDato: (endringsdato?: Date) => void;
  setTariffEndringsdato: (endringsdato?: Date) => void;
  setTariffKjentdato: (kjentFraDato?: Date) => void;
  setNyStillingDato: (dato?: Date) => void;
  setNyStillingsprosentDato: (dato?: Date) => void;
  setPermisjonPeriode: (periode: Array<Periode> | undefined) => void;
  setPermitteringPeriode: (periode: Array<Periode> | undefined) => void;
  setSykefravaerPeriode: (periode: Array<Periode> | undefined) => void;
  tilbakestillMaanedsinntekt: () => void;
  setTidligereInntekter: (tidligereInntekt: Array<HistoriskInntekt>) => void;
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<HistoriskInntekt>,
    bestemmendeFravaersdag: Date,
    feilHentingAvInntektsdata?: Array<FeilReportElement>
  ) => void;
  rekalkulerBruttoinntekt: (bestemmendeFravaersdag: Date) => void;
  slettBruttoinntekt: () => void;
}

const useBruttoinntektStore: StateCreator<CompleteState, [], [], BruttoinntektState> = (set, get) => ({
  bruttoinntekt: {
    bruttoInntekt: undefined,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: undefined,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  tidligereInntekt: undefined,
  henterData: false,
  setNyMaanedsinntekt: (beloep: string) => {
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(beloep);
        if (state.bruttoinntekt.bruttoInntekt !== state.opprinneligbruttoinntekt.bruttoInntekt) {
          state.bruttoinntekt.manueltKorrigert = true;
        }

        state = slettFeilmeldingFraState(state, 'inntekt.beregnetInntekt');

        if (ugyldigEllerNegativtTall(state.bruttoinntekt.bruttoInntekt)) {
          state = leggTilFeilmelding(state, 'inntekt.beregnetInntekt', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { beloep: stringishToNumber(beloep) };
        } else {
          state.lonnISykefravaeret.beloep = stringishToNumber(beloep);
        }

        state = slettFeilmeldingFraState(state, 'lus-input');
        if (!beloep || stringishToNumber(beloep)! < 0) {
          state = leggTilFeilmelding(state, 'lus-input', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }

        return state;
      })
    );
  },
  setNyMaanedsinntektBlanktSkjema: (beloep: string | number) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = typeof beloep === 'string' ? stringishToNumber(beloep) : beloep;
        state.bruttoinntekt.manueltKorrigert = false;
        if (state.bruttoinntekt.bruttoInntekt !== undefined && state.bruttoinntekt.bruttoInntekt >= 0) {
          state = slettFeilmeldingFraState(state, 'inntekt.beregnetInntekt');
        } else {
          state = leggTilFeilmelding(state, 'inntekt.beregnetInntekt', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),

  setEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        if (aarsak && aarsak !== '') {
          state.bruttoinntekt.manueltKorrigert = true;
        } else {
          state.bruttoinntekt.manueltKorrigert = false;
        }

        if (aarsak && aarsak !== '') {
          state = slettFeilmeldingFraState(state, 'bruttoinntekt-endringsaarsak');
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
        state.tariffendringDato = endringsdato;

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
  setPermitteringPeriode: (periode) =>
    set(
      produce((state) => {
        state.permittering = periode;
        return state;
      })
    ),
  setSykefravaerPeriode: (periode) =>
    set(
      produce((state) => {
        state.sykefravaerperioder = periode;
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
  setTidligereInntekter: (tidligereInntekt: Array<HistoriskInntekt>) =>
    set(
      produce((state) => {
        state.tidligereInntekt = tidligereInntekt.map((inntekt) => ({
          maaned: inntekt.maaned,
          inntekt: inntekt.inntekt
        }));
        return state;
      })
    ),
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<HistoriskInntekt>,
    bestemmendeFravaersdag: Date,
    feilHentingAvInntektsdata?
  ) => {
    const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const sumInntekter = aktuelleInntekter.reduce((prev, cur) => {
      prev += cur.inntekt ?? 0;
      return prev;
    }, 0);

    const snittInntekter = bruttoInntekt
      ? roundTwoDecimals(bruttoInntekt)
      : roundTwoDecimals(sumInntekter / aktuelleInntekter.length);

    set(
      produce((state) => {
        if (!state.bruttoInntekt) {
          state.bruttoInntekt = {};
        }
        if (!state.opprinneligbruttoinntekt) {
          state.opprinneligbruttoinntekt = {};
        }
        state.bruttoinntekt = {
          ...state.bruttoInntekt,
          bruttoInntekt: snittInntekter || 0,
          manueltKorrigert: false
        };
        state.opprinneligbruttoinntekt = {
          ...state.opprinneligbruttoinntekt,
          bruttoInntekt: snittInntekter || 0,
          manueltKorrigert: false
        };

        if (!state.bruttoinntekt.endringsaarsak) {
          state.bruttoinntekt.endringsaarsak = '';
        }
        if (!state.opprinneligbruttoinntekt.endringsaarsak) {
          state.opprinneligbruttoinntekt.endringsaarsak = '';
        }
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
        state.opprinneligeInntekt = tidligereInntekt;

        if (aktuelleInntekter) {
          state.tidligereInntekt = aktuelleInntekter.map((inntekt) => ({
            maaned: inntekt.maaned,
            inntekt: inntekt.inntekt
          }));
        }

        state.feilHentingAvInntektsdata = feilHentingAvInntektsdata;

        return state;
      })
    );
  },
  rekalkulerBruttoinntekt: async (bestemmendeFravaersdag: Date) => {
    const opprinneligeInntekt = get().opprinneligeInntekt || [];
    let tidligereInntekt = structuredClone(opprinneligeInntekt);
    const bruttoinntekt = get().bruttoinntekt;

    const slug = Router.query.slug as string;
    let henterData = get().henterData;
    const sisteLonnshentedato = get().sisteLonnshentedato;

    let snittInntekter = 0;

    if (
      !(henterData || !sisteLonnshentedato || !bestemmendeFravaersdag) &&
      startOfMonth(sisteLonnshentedato).getMonth() !== startOfMonth(bestemmendeFravaersdag).getMonth()
    ) {
      henterData = true;
      set(
        produce((state) => {
          state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
          state.henterData = henterData;
        })
      );
      const oppdaterteInntekter = await fetchInntektsdata(environment.inntektsdataUrl, slug, bestemmendeFravaersdag);

      oppdaterteInntekter.tidligereInntekter.forEach((inntekt: HistoriskInntekt) => {
        if (!tidligereInntekt.find((element) => element.maaned === inntekt.maaned)) {
          tidligereInntekt.push(inntekt);
        }
      });
      henterData = false;

      snittInntekter = oppdaterteInntekter.bruttoinntekt;
    } else {
      const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);

      const sumInntekter = aktuelleInntekter.reduce((prev, cur) => {
        prev += cur.inntekt ?? 0;
        return prev;
      }, 0);

      snittInntekter = sumInntekter / aktuelleInntekter.length;
    }

    set(
      produce((state) => {
        state.henterData = henterData;
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
        if (!bruttoinntekt.manueltKorrigert) {
          state.bruttoinntekt = {
            bruttoInntekt: snittInntekter,
            manueltKorrigert: false,
            endringsaarsak: ''
          };
        }

        state.opprinneligeInntekt = tidligereInntekt;

        if (tidligereInntekt) {
          state.tidligereInntekt = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
        }

        return state;
      })
    );
  },
  setOpprinneligNyMaanedsinntekt: () => {
    set(
      produce((state) => {
        state.opprinneligbruttoinntekt = { ...state.bruttoinntekt };
        return state;
      })
    );
  },
  slettBruttoinntekt: () => {
    set(
      produce((state) => {
        state.bruttoinntekt = {
          bruttoInntekt: undefined,
          manueltKorrigert: false,
          endringsaarsak: undefined
        };

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
    .filter((inntekt) => inntekt.maaned < bestemmendeMaaned && inntekt.maaned >= sisteMaaned)
    .sort(sorterInntekter)
    .slice(0, 3);

  return aktuelleInntekter || [];
}
