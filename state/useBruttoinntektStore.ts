import { StateCreator } from 'zustand';
import produce from 'immer';
import { HistoriskInntekt, Inntekt, Periode } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import { MottattHistoriskInntekt } from './MottattData';
import feiltekster from '../utils/feiltekster';
import { leggTilFeilmelding, slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { CompleteState } from './useBoundStore';
import { subMonths, startOfMonth } from 'date-fns';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import environment from '../config/environment';

export const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maanedsnavn < b.maanedsnavn) {
    return 1;
  } else if (a.maanedsnavn > b.maanedsnavn) {
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
  permitering?: Array<Periode>;
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
  setPermiteringPeriode: (periode: Array<Periode> | undefined) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean, reset?: boolean) => void;
  initBruttoinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<MottattHistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => void;
  rekalkulerBruttioinntekt: (bestemmendeFravaersdag: Date) => void;
  oppdaterBruttoinntekt: (bestemmendeFravaersdag: Date) => void;
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
  setNyMaanedsinntekt: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;
        if (state.bruttoinntekt.bruttoInntekt != undefined && state.bruttoinntekt.bruttoInntekt >= 0) {
          state = slettFeilmeldingFraState(state, 'bruttoinntekt-endringsbelop');
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
          state = slettFeilmeldingFraState(state, 'bruttoinntekt-endringsbelop');
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
          state = slettFeilmeldingFraState(state, 'bruttoinntektbekreft');
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
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
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
  rekalkulerBruttioinntekt: async (bestemmendeFravaersdag: Date) => {
    const opprinneligeInntekt = get().opprinneligeInntekt || [];
    let tidligereInntekt = structuredClone(opprinneligeInntekt);
    const bruttoinntekt = get().bruttoinntekt;
    const slug = get().slug;
    const henterData = get().henterData;
    const sisteLonnshentedato = get().sisteLonnshentedato;

    if (
      !(henterData || !sisteLonnshentedato || !bestemmendeFravaersdag) &&
      startOfMonth(sisteLonnshentedato) !== startOfMonth(bestemmendeFravaersdag)
    ) {
      set(
        produce((state) => {
          state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
          state.henterData = true;
        })
      );
      const oppdaterteInntekter = await fetchInntektsdata(environment.inntektsdataUrl, slug, bestemmendeFravaersdag);
      if (oppdaterteInntekter.tidligereInntekter && tidligereInntekt) {
        oppdaterteInntekter.tidligereInntekter.forEach((inntekt: HistoriskInntekt) => {
          if (!tidligereInntekt?.find((tidliger) => tidliger.maanedsnavn === inntekt.maanedsnavn)) {
            tidligereInntekt?.push(inntekt);
          }
        });
      } else {
        tidligereInntekt = oppdaterteInntekter.tidligereInntekter;
      }
    }

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
        state.henterData = false;
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
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
  },
  oppdaterBruttoinntekt: (bestemmendeFravaersdag: Date) => {
    // Sjekk om vi har perioden allerede.
    // Hent data om vi ikke har det.
    //

    set(
      produce((state) => {
        // Lagre data
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
