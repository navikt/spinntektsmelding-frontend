import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { HistoriskInntekt } from './state';
import { MottattPeriodeRefusjon, TDateISODate } from './MottattData';
import skjemaVariant from '../config/skjemavariant';
import parseIsoDate from '../utils/parseIsoDate';

export type Opplysningstype = (typeof skjemaVariant)[keyof typeof skjemaVariant];

type FourDigitString = string & { length: 4 } & { [Symbol.match](string: string): RegExpMatchArray | null };

type Beregningsmåned = `${FourDigitString}-${
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'}`;

type Beregningsmåneder = Array<Beregningsmåned>;

type OpplysningstypeInntekt = 'ForslagInntektFastsatt' | 'ForslagInntektGrunnlag';

export type ForrigeInntekt = {
  skjæringstidspunkt: TDateISODate;
  kilde: 'INNTEKTSMELDING' | 'AAREG';
  beløp: number;
};

type ForslagInntekt = {
  type: OpplysningstypeInntekt;
  beregningsmaaneder?: Beregningsmåneder;
  forrigeInntekt?: ForrigeInntekt;
};

type ForslagRefusjon = {
  opphoersdato: TDateISODate | null;
  perioder: Array<MottattPeriodeRefusjon>;
  refundert?: number;
};

type ForespurtData = {
  paakrevd: boolean;
  forslag?: ForslagInntekt & ForslagRefusjon;
};

export type MottattForespurtData = {
  [key in Opplysningstype]: ForespurtData;
};

export interface ForespurtDataState {
  forespurtData?: MottattForespurtData;
  refusjonTilArbeidsgiver?: number;
  ukjentInntekt: boolean;
  gammeltSkjaeringstidspunkt?: Date;
  paakrevdeOpplysninger?: Array<Opplysningstype>;
  initForespurtData: (
    forespurtData: MottattForespurtData,
    mottattBestemmendeFravaersdag: string,
    bruttoinntekt: number,
    tidligereinntekter: HistoriskInntekt[]
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
      initBruttoinntekt(bruttoinntekt, tidligereinntekter, bestemmendeFravaersdag!, undefined);

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

    return Object.keys(skjemaVariant) as Array<Opplysningstype>;
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
      if (refusjon.perioder.length === 1 && refusjon.perioder[0].beloep === 0) {
        return false;
      }
      return refusjon.perioder.length > 0;
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
