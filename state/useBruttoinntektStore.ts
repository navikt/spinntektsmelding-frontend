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
  tariffendringsdato?: Date;
  tariffkjentdato?: Date;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  permisjon?: Array<Periode>;
  permittering?: Array<Periode>;
  sisteLonnshentedato?: Date;
  henterData: boolean;
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
  setPermitteringPeriode: (periode: Array<Periode> | undefined) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean, reset?: boolean) => void;
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<HistoriskInntekt>,
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
  henterData: false,
  setNyMaanedsinntekt: (belop: string) => {
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;

        if (state.bruttoinntekt.bruttoInntekt != undefined && state.bruttoinntekt.bruttoInntekt >= 0) {
          state = slettFeilmeldingFraState(state, 'inntekt.beregnetInntekt');
        } else {
          state = leggTilFeilmelding(state, 'inntekt.beregnetInntekt', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        if (!state.lonnISykefravaeret) {
          state.lonnISykefravaeret = { belop: stringishToNumber(belop) };
        } else {
          state.lonnISykefravaeret.belop = stringishToNumber(belop);
        }

        if (belop && stringishToNumber(belop)! >= 0) {
          state = slettFeilmeldingFraState(state, 'lus-input');
        } else {
          state = leggTilFeilmelding(state, 'lus-input', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }

        return state;
      })
    );
  },
  setNyMaanedsinntektBlanktSkjema: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = false;
        state.bruttoinntekt.bekreftet = true;
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
        state.bruttoinntekt.manueltKorrigert = true;

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
  setPermitteringPeriode: (periode) =>
    set(
      produce((state) => {
        state.permittering = periode;
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
          state = slettFeilmeldingFraState(state, 'bruttoinntektbekreft');
        }

        return state;
      })
    ),
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<HistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => {
    const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const sumInntekter = aktuelleInntekter.reduce(
      (prev, cur) => {
        prev.inntekt += cur.inntekt;
        return prev;
      },
      { inntekt: 0, maaned: '' }
    );

    const snittInntekter = bruttoInntekt
      ? roundTwoDecimals(bruttoInntekt)
      : roundTwoDecimals(sumInntekter.inntekt / aktuelleInntekter.length);

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
          bruttoInntekt: snittInntekter,
          bekreftet: true,
          manueltKorrigert: false
        };
        state.opprinneligbruttoinntekt = {
          ...state.opprinneligbruttoinntekt,
          bruttoInntekt: snittInntekter,
          bekreftet: true,
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

        return state;
      })
    );
  },
  rekalkulerBruttioinntekt: async (bestemmendeFravaersdag: Date) => {
    const opprinneligeInntekt = get().opprinneligeInntekt || [];
    let tidligereInntekt = structuredClone(opprinneligeInntekt);
    const bruttoinntekt = get().bruttoinntekt;
    const slug = get().slug;
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

      const sumInntekter = aktuelleInntekter.reduce(
        (prev, cur) => {
          prev.inntekt += cur.inntekt;
          return prev;
        },
        { inntekt: 0, maaned: '' }
      );

      snittInntekter = sumInntekter.inntekt / aktuelleInntekter.length;
    }

    set(
      produce((state) => {
        state.henterData = henterData;
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
        if (!bruttoinntekt.bekreftet && !bruttoinntekt.manueltKorrigert) {
          state.bruttoinntekt = {
            bruttoInntekt: snittInntekter,
            bekreftet: false,
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
