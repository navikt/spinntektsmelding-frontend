import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { ForrigeInntekt, MottattForespurtData, Opplysningstype } from '../schema/forespurtData';
import parseIsoDate from '../utils/parseIsoDate';
import forespoerselType from '../config/forespoerselType';
import { HistoriskInntekt } from '../schema/historiskInntektSchema';

export interface ForespurtDataState {
  forespurtData?: MottattForespurtData;
  refusjonTilArbeidsgiver?: number;
  ukjentInntekt: boolean;
  gammeltSkjaeringstidspunkt?: Date;
  paakrevdeOpplysninger?: Array<Opplysningstype>;
  initForespurtData: (
    forespurtData: MottattForespurtData,
    mottattBestemmendeFravaersdag: string,
    bruttoinntekt: number | null,
    tidligereinntekter: HistoriskInntekt | null
  ) => void;
  hentOpplysningstyper: () => Array<Opplysningstype>;
  hentPaakrevdOpplysningstyper: () => Array<Opplysningstype>;
  setPaakrevdeOpplysninger: (paakrevdeOpplysninger: Array<Opplysningstype>) => void;
  setTidligereInntektsdata: (inntekt: ForrigeInntekt) => void;
  kanBruttoinntektTilbakebestilles: () => boolean;
  arbeidsgiverKreverRefusjon: () => boolean;
  arbeidsgiverRefusjonskravOpphører: () => boolean;
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  ukjentInntekt: false,
  forespurtData: undefined,
  initForespurtData: (forespurtData, mottattBestemmendeFravaersdag, bruttoinntekt, tidligereinntekter) => {
    const slettAlleArbeidsgiverperioder = get().slettAlleArbeidsgiverperioder;
    const initBruttoinntekt = get().initBruttoinntekt;

    const bestemmendeFravaersdag = parseIsoDate(mottattBestemmendeFravaersdag);

    const arbeidsgiverperiodePaakrevd = forespurtData?.arbeidsgiverperiode?.paakrevd;

    if (!arbeidsgiverperiodePaakrevd) {
      initBruttoinntekt(bruttoinntekt, tidligereinntekter, bestemmendeFravaersdag!);

      slettAlleArbeidsgiverperioder();
    }

    set(
      produce((state: ForespurtDataState) => {
        state.forespurtData = forespurtData;
        state.paakrevdeOpplysninger = Object.keys(forespurtData).filter(
          (key) => forespurtData[key as keyof typeof forespurtData].paakrevd === true
        ) as Array<Opplysningstype>;

        state.gammeltSkjaeringstidspunkt = parseIsoDate(mottattBestemmendeFravaersdag);
        return state;
      })
    );
  },
  hentOpplysningstyper: () => {
    const forespurtData = get().forespurtData;
    if (forespurtData) {
      return Object.keys(forespurtData) as Array<Opplysningstype>;
    }

    return [];
  },
  hentPaakrevdOpplysningstyper: () => {
    const forespurtData = get().forespurtData;
    const paakrevdeOpplysninger = get().paakrevdeOpplysninger;

    if (paakrevdeOpplysninger && paakrevdeOpplysninger.length > 0) {
      return paakrevdeOpplysninger;
    } else if (forespurtData) {
      return Object.keys(forespurtData).filter(
        (key) => forespurtData[key as keyof typeof forespurtData].paakrevd === true
      ) as Array<Opplysningstype>;
    }

    return Object.keys(forespoerselType) as Array<Opplysningstype>;
  },

  setPaakrevdeOpplysninger: (paakrevdeOpplysninger) => {
    set(
      produce((state: ForespurtDataState) => {
        state.paakrevdeOpplysninger = paakrevdeOpplysninger;

        return state;
      })
    );
  },
  setTidligereInntektsdata: (inntekt: ForrigeInntekt) => {
    set(
      produce((state: ForespurtDataState) => {
        state.gammeltSkjaeringstidspunkt = parseIsoDate(inntekt.skjæringstidspunkt);

        return state;
      })
    );
  },
  kanBruttoinntektTilbakebestilles: () => {
    const inntekt = get().forespurtData?.inntekt?.forslag?.forrigeInntekt?.beløp;

    if (inntekt) {
      return true;
    } else {
      return false;
    }
  },
  arbeidsgiverKreverRefusjon: () => {
    const refusjon = get().forespurtData?.refusjon?.forslag;

    if (refusjon) {
      if (refusjon.perioder && refusjon.perioder.length === 1 && refusjon.perioder[0].beloep === 0) {
        return false;
      }
      return Boolean(refusjon.perioder && refusjon.perioder.length > 0);
    } else {
      return false;
    }
  },

  arbeidsgiverRefusjonskravOpphører: () => {
    const refusjon = get().forespurtData?.refusjon?.forslag;

    if (refusjon) {
      return refusjon.opphoersdato !== null;
    } else {
      return false;
    }
  }
});

export default useForespurtDataStore;
