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
import { EndringAarsak } from '../validators/validerAapenInnsending';
import isValidUUID from '../utils/isValidUUID';

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
  sisteLonnshentedato?: Date;
  henterData: boolean;
  feilHentingAvInntektsdata?: Array<FeilReportElement>;
  setNyMaanedsinntektOgRefusjonsbeloep: (beloep: string) => void;
  setBareNyMaanedsinntekt: (beloep: string | number) => void;
  setOpprinneligNyMaanedsinntekt: () => void;
  setEndringsaarsak: (aarsak: string) => void;
  setPerioder: (periode: Array<Periode> | undefined) => void;
  setEndringAarsakGjelderFra: (endringsdato?: Date) => void;
  setEndringAarsakBleKjent: (kjentFraDato?: Date) => void;
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
  setEndringAarsak: (endringAarsak: EndringAarsak) => void;
}

const useBruttoinntektStore: StateCreator<CompleteState, [], [], BruttoinntektState> = (set, get) => ({
  bruttoinntekt: {
    bruttoInntekt: undefined,
    manueltKorrigert: false,
    endringAarsak: undefined
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

  setEndringsaarsak: (aarsak: string | undefined) =>
    set(
      produce((state) => {
        if (aarsak === '') {
          aarsak = undefined;
        }
        if (!state.bruttoinntekt.endringAarsak?.aarsak || state.bruttoinntekt.endringAarsak?.aarsak !== aarsak) {
          state.bruttoinntekt.endringAarsak = { aarsak: aarsak };
        } else {
          state.bruttoinntekt.endringAarsak.aarsak = aarsak;
        }

        if (aarsak && aarsak !== undefined) {
          state.bruttoinntekt.manueltKorrigert = true;
        } else {
          state.bruttoinntekt.manueltKorrigert = false;
        }

        if (aarsak && aarsak !== undefined) {
          state = slettFeilmeldingFraState(state, 'bruttoinntekt-endringsaarsak');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsaarsak', feiltekster.ENDRINGSAARSAK_MANGLER);
        }
        return state;
      })
    ),
  setPerioder: (periode) => {
    const aarsak = get().bruttoinntekt.endringAarsak?.aarsak.toLowerCase();

    set(
      produce((state) => {
        let aarsakIndex = '';
        switch (aarsak) {
          case 'ferie':
            aarsakIndex = 'ferier';
            break;
          case 'permisjon':
            aarsakIndex = 'permisjoner';
            break;
          case 'permittering':
            aarsakIndex = 'permitteringer';
            break;
          default:
            aarsakIndex = aarsak!;
            break;
        }

        state.bruttoinntekt.endringAarsak[aarsakIndex] =
          periode?.map((periode) => ({
            fom: periode.fom,
            tom: periode.tom
          })) || [];

        return state;
      })
    );
  },
  setEndringAarsakGjelderFra: (endringDato) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringAarsak.gjelderFra = endringDato;
        return state;
      })
    ),
  setEndringAarsakBleKjent: (kjentFraDato?: Date) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringAarsak.bleKjent = kjentFraDato;
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

        if (!state.bruttoinntekt.endringAarsak) {
          state.bruttoinntekt.endringAarsak = { aarsak: undefined };
        }
        if (!state.bruttoinntekt.endringAarsak.aarsak) {
          state.bruttoinntekt.endringAarsak.aarsak = undefined;
        }

        if (!state.opprinneligbruttoinntekt.endringAarsak) {
          state.opprinneligbruttoinntekt.endringAarsak = { aarsak: undefined };
        }
        if (!state.opprinneligbruttoinntekt.endringAarsak.aarsak) {
          state.opprinneligbruttoinntekt.endringAarsak.aarsak = undefined;
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

    const forespoerselId = Array.isArray(slug) ? (slug[0] as string) : (slug as string);

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
  setEndringAarsak: (endringAarsak: EndringAarsak) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringAarsak = endringAarsak;
        state.opprinneligbruttoinntekt.endringAarsak = endringAarsak;
        return state;
      })
    )
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
