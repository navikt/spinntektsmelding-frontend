import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Inntekt } from './state';
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
import { ApiEndringAarsakSchema } from '../schema/ApiEndringAarsakSchema';
import { z } from 'zod';
import parseIsoDate from '../utils/parseIsoDate';
import forespoerselType from '../config/forespoerselType';
import { HistoriskInntekt } from '../schema/HistoriskInntektSchema';

export const sorterInntekter = (a: [string, number | null], b: [string, number | null]) => {
  if (a[0] < b[0]) {
    return 1;
  } else if (a[0] > b[0]) {
    return -1;
  }

  return 0;
};

type ApiEndringAarsak = z.infer<typeof ApiEndringAarsakSchema>;

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  opprinneligbruttoinntekt: Inntekt;
  tidligereInntekt?: HistoriskInntekt;
  opprinneligeInntekt?: HistoriskInntekt;
  sisteLonnshentedato?: Date;
  henterData: boolean;
  setNyMaanedsinntektOgRefusjonsbeloep: (beloep: string) => void;
  setBareNyMaanedsinntekt: (beloep: string | number) => void;
  setOpprinneligNyMaanedsinntekt: () => void;
  tilbakestillMaanedsinntekt: () => void;
  setTidligereInntekter: (tidligereInntekt: HistoriskInntekt) => void;
  initBruttoinntekt: (
    bruttoInntekt: number | null,
    tidligereInntekt: HistoriskInntekt | null,
    bestemmendeFravaersdag: Date
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
    endringAarsak: undefined,
    endringAarsaker: undefined
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
  setTidligereInntekter: (tidligereInntekt: HistoriskInntekt | null) =>
    set(
      produce((state) => {
        if (tidligereInntekt) {
          const merged = new Map([...state.tidligereInntekt, ...tidligereInntekt]);

          state.tidligereInntekt = merged;
        }

        return state;
      })
    ),
  initBruttoinntekt: (
    bruttoInntekt: number | null,
    tidligereInntekt: HistoriskInntekt | null,
    bestemmendeFravaersdag: Date
  ) => {
    const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const arrInntekter = Array.from(aktuelleInntekter);
    const sumInntekter = arrInntekter.reduce((prev, cur) => {
      if (cur[1] == null) {
        return prev;
      }
      prev += typeof cur[1] === 'number' ? cur[1] : 0;
      return prev;
    }, 0);

    const snittInntekter =
      typeof bruttoInntekt === 'number'
        ? roundTwoDecimals(bruttoInntekt)
        : roundTwoDecimals(sumInntekter / arrInntekter.length);

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

        state.bruttoinntekt.endringAarsaker ??= [{ aarsak: undefined }];

        state.bruttoinntekt.endringAarsaker[0].aarsak ??= undefined;

        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
        state.opprinneligeInntekt = tidligereInntekt;

        if (arrInntekter) {
          state.tidligereInntekt = new Map(arrInntekter);
        }

        return state;
      })
    );
  },
  rekalkulerBruttoinntekt: async (bestemmendeFravaersdag: Date) => {
    const opprinneligeInntekt = get().opprinneligeInntekt || [];
    let tidligereInntekt = structuredClone(opprinneligeInntekt);
    const bruttoinntekt = get().bruttoinntekt;
    const hentPaakrevdOpplysningstyper = get().hentPaakrevdOpplysningstyper;

    const slug = Router.query.slug as string;

    const forespoerselId = Array.isArray(slug) ? (slug[0] as string) : slug;

    const opplysningstyper = hentPaakrevdOpplysningstyper();
    const harForespurtArbeidsgiverperiode = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
    let henterData = get().henterData;
    const sisteLonnshentedato = get().sisteLonnshentedato;

    let snittInntekter = 0;

    if (
      !(henterData || !sisteLonnshentedato || !bestemmendeFravaersdag) &&
      startOfMonth(sisteLonnshentedato).getMonth() !== startOfMonth(bestemmendeFravaersdag).getMonth() &&
      isValidUUID(forespoerselId) &&
      harForespurtArbeidsgiverperiode
    ) {
      henterData = true;
      try {
        const inntektsdata = await fetchInntektsdata(
          environment.inntektsdataUrl,
          forespoerselId,
          bestemmendeFravaersdag
        );
        const oppdaterteInntekter = inntektsdata.data;

        tidligereInntekt = oppdaterteInntekter.historikk;
        snittInntekter = oppdaterteInntekter.gjennomsnitt;
      } catch (error: unknown) {
        console.warn('Error fetching inntektsdata:', error);
        const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt as HistoriskInntekt, bestemmendeFravaersdag);
        const arrInntekter = Array.from(aktuelleInntekter);
        const sumInntekter = arrInntekter.reduce((prev, cur) => {
          prev += (cur[1] as number) ?? 0;
          return prev;
        }, 0);

        snittInntekter = arrInntekter.length > 0 ? sumInntekter / arrInntekter.length : 0;
      } finally {
        henterData = false;
      }
    } else {
      const aktuelleInntekter = finnAktuelleInntekter(tidligereInntekt as HistoriskInntekt, bestemmendeFravaersdag);
      const arrInntekter = Array.from(aktuelleInntekter);
      const sumInntekter = arrInntekter.reduce((prev, cur) => {
        prev += (cur[1] as number) ?? 0;
        return prev;
      }, 0);

      snittInntekter = sumInntekter / arrInntekter.length;
    }

    set(
      produce((state) => {
        state.henterData = henterData;
        state.sisteLonnshentedato = startOfMonth(bestemmendeFravaersdag);
        if (!bruttoinntekt.manueltKorrigert) {
          state.bruttoinntekt = {
            bruttoInntekt: snittInntekter,
            manueltKorrigert: false,
            endringAarsaker: undefined
          };
        }

        state.opprinneligeInntekt = tidligereInntekt;

        if (tidligereInntekt) {
          state.tidligereInntekt = finnAktuelleInntekter(tidligereInntekt as HistoriskInntekt, bestemmendeFravaersdag);
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
          endringAarsaker: undefined
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

export function finnAktuelleInntekter(tidligereInntekt: HistoriskInntekt | null, bestemmendeFravaersdag: Date) {
  const bestMnd = `00${bestemmendeFravaersdag.getMonth() + 1}`.slice(-2);
  const bestemmendeMaaned = `${bestemmendeFravaersdag.getFullYear()}-${bestMnd}`;
  const sisteMnd = `00${subMonths(bestemmendeFravaersdag, 3).getMonth() + 1}`.slice(-2);
  const sisteMaaned = `${subMonths(bestemmendeFravaersdag, 3).getFullYear()}-${sisteMnd}`;
  if (!tidligereInntekt) return new Map<string, number | null>([]);

  const arrayTidligereInntekt: [string, number | null][] = Object.entries(tidligereInntekt).map(
    ([key, value]) => [key, value] as [string, number | null]
  );

  const aktuelleInntekter = new Map<string, number | null>(
    arrayTidligereInntekt
      .filter(([key, value]) => key < bestemmendeMaaned && key >= sisteMaaned)
      .sort(sorterInntekter)
      .slice(0, 3)
  );
  return aktuelleInntekter;
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
            : endringAarsak.permitteringer.map((permittering) => ({
                fom: parseIsoDate(permittering.fom)!,
                tom: parseIsoDate(permittering.tom)!
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
