import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { HistoriskInntekt, Inntekt } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import feiltekster from '../utils/feiltekster';
import { leggTilFeilmelding, slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { CompleteState } from './useBoundStore';
import { subMonths, startOfMonth } from 'date-fns';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import environment from '../config/environment';
import roundTwoDecimals from '../utils/roundTwoDecimals';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import Router from 'next/router';
import { EndringAarsak } from '../validators/validerAapenInnsending';
import isValidUUID from '../utils/isValidUUID';
import { EndringAarsakSchema } from '../schema/apiEndringAarsakSchema';
import { z } from 'zod';
import parseIsoDate from '../utils/parseIsoDate';
import { FeilReportElement } from '../schema/feilRepportSchema';

export const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maaned < b.maaned) {
    return 1;
  } else if (a.maaned > b.maaned) {
    return -1;
  }

  return 0;
};

type ApiEndringAarsak = z.infer<typeof EndringAarsakSchema>;

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  opprinneligbruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  opprinneligeInntekt?: Array<HistoriskInntekt>;
  sisteLonnshentedato?: Date;
  henterData: boolean;
  feilHentingAvInntektsdata?: Array<FeilReportElement>;
  setNyMaanedsinntektOgRefusjonsbeloep: (beloep: string) => void;
  setBareNyMaanedsinntekt: (beloep: string | number) => void;
  setOpprinneligNyMaanedsinntekt: () => void;
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
  setEndringAarsaker: (endringAarsaker: Array<EndringAarsak | ApiEndringAarsak>) => void;
}

const useBruttoinntektStore: StateCreator<CompleteState, [], [], BruttoinntektState> = (set, get) => ({
  bruttoinntekt: {
    bruttoInntekt: undefined,
    manueltKorrigert: false,
    endringAarsak: undefined,
    endringAarsaker: undefined
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: undefined,
    manueltKorrigert: false,
    endringAarsak: undefined
  },
  tidligereInntekt: undefined,
  henterData: false,
  setNyMaanedsinntektOgRefusjonsbeloep: (beloep: string) => {
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

        state = slettFeilmeldingFraState(state, 'refusjon.beloepPerMaaned');
        if (!beloep || stringishToNumber(beloep)! < 0) {
          state = leggTilFeilmelding(state, 'refusjon.beloepPerMaaned', feiltekster.LONN_UNDER_SYKEFRAVAERET_BELOP);
        }

        return state;
      })
    );
  },
  setBareNyMaanedsinntekt: (beloep: string | number) =>
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

    const snittInntekter =
      typeof bruttoInntekt === 'number'
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

        state.bruttoinntekt.endringAarsak ??= { aarsak: undefined };

        state.bruttoinntekt.endringAarsak.aarsak ??= undefined;

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

    const forespoerselId = Array.isArray(slug) ? (slug[0] as string) : slug;

    let henterData = get().henterData;
    const sisteLonnshentedato = get().sisteLonnshentedato;

    let snittInntekter = 0;

    if (
      !(henterData || !sisteLonnshentedato || !bestemmendeFravaersdag) &&
      startOfMonth(sisteLonnshentedato).getMonth() !== startOfMonth(bestemmendeFravaersdag).getMonth() &&
      isValidUUID(forespoerselId)
    ) {
      henterData = true;

      const inntektsdata = await fetchInntektsdata(environment.inntektsdataUrl, forespoerselId, bestemmendeFravaersdag);
      const oppdaterteInntekter = inntektsdata.data;

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
            endringAarsak: undefined
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
          endringAarsak: undefined
        };

        return state;
      })
    );
  },
  setEndringAarsaker: (endringAarsaker: Array<EndringAarsak | ApiEndringAarsak>) => {
    const normalisertEndringAarsaker = endringAarsaker ? endringAarsaker.map(normaliserEndringAarsak) : [];
    set(
      produce((state) => {
        state.bruttoinntekt.endringAarsaker = normalisertEndringAarsaker;
        state.opprinneligbruttoinntekt.endringAarsaker = normalisertEndringAarsaker;
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

function normaliserEndringAarsak(endringAarsak: EndringAarsak | ApiEndringAarsak): EndringAarsak {
  if (endringAarsak?.aarsak) {
    switch (endringAarsak.aarsak) {
      case 'Ferie': {
        endringAarsak.ferier =
          typeof endringAarsak.ferier[0].fom !== 'string'
            ? endringAarsak.ferier
            : endringAarsak.ferier.map((ferie) => ({
                fom: parseIsoDate(ferie.fom)!,
                tom: parseIsoDate(ferie.tom)!
              }));
        break;
      }

      case 'Permisjon': {
        endringAarsak.permisjoner =
          typeof endringAarsak.permisjoner[0].fom !== 'string'
            ? endringAarsak.permisjoner
            : endringAarsak.permisjoner.map((permisjon) => ({
                fom: parseIsoDate(permisjon.fom)!,
                tom: parseIsoDate(permisjon.tom)!
              }));
        break;
      }

      case 'Permittering': {
        endringAarsak.permitteringer =
          typeof endringAarsak.permitteringer[0].fom !== 'string'
            ? endringAarsak.permitteringer
            : endringAarsak.permitteringer.map((permitering) => ({
                fom: parseIsoDate(permitering.fom)!,
                tom: parseIsoDate(permitering.tom)!
              }));
        break;
      }

      case 'Sykefravaer': {
        endringAarsak.sykefravaer =
          typeof endringAarsak.sykefravaer[0].fom !== 'string'
            ? endringAarsak.sykefravaer
            : endringAarsak.sykefravaer.map((syk) => ({
                fom: parseIsoDate(syk.fom)!,
                tom: parseIsoDate(syk.tom)!
              }));
        break;
      }

      case 'Tariffendring': {
        endringAarsak.bleKjent = konverterTilDate(endringAarsak.bleKjent)!;
        endringAarsak.gjelderFra = konverterTilDate(endringAarsak.gjelderFra)!;

        break;
      }
      case 'NyStilling':
      case 'NyStillingsprosent':
      case 'VarigLoennsendring': {
        endringAarsak.gjelderFra = konverterTilDate(endringAarsak.gjelderFra)!;

        break;
      }
    }
  }
  return endringAarsak as EndringAarsak;
}

function konverterTilDate(dato: string | Date) {
  return typeof dato === 'string' ? parseIsoDate(dato) : dato;
}
