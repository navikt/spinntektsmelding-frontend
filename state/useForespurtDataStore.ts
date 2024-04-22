import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { isEqual, parseISO } from 'date-fns';
import { YesNo } from './state';
import { MottattPeriodeRefusjon, TDateISODate } from './MottattData';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import skjemaVariant from '../config/skjemavariant';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import parseIsoDate from '../utils/parseIsoDate';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';

export type Opplysningstype = (typeof skjemaVariant)[keyof typeof skjemaVariant];

// type Beregningsmåneder = `${number}-${number}`;

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
  fastsattInntekt?: number;
  ukjentInntekt: boolean;
  gammeltSkjaeringstidspunkt?: Date;
  paakrevdeOpplysninger?: Array<Opplysningstype>;
  initForespurtData: (forespurtData: MottattForespurtData) => void;
  hentOpplysningstyper: () => Array<Opplysningstype>;
  hentPaakrevdOpplysningstyper: () => Array<Opplysningstype>;
  setPaakrevdeOpplysninger: (paakrevdeOpplysninger: Array<Opplysningstype>) => void;
  setTidligereInntektsdata: (inntekt: ForrigeInntekt) => void;
  kanBruttoinntektTilbakebestilles: () => boolean;
  arbeidsgiverKreverRefusjon: () => boolean;
  arbeidsgiverRefusjonskravOpphører: () => boolean;
  arbeidsgiverRefusjonskravHarEndringer: () => boolean;
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  ukjentInntekt: false,
  forespurtData: undefined,
  initForespurtData: (forespurtData) => {
    const initRefusjonEndringer = get().initRefusjonEndringer;
    const initLonnISykefravaeret = get().initLonnISykefravaeret;
    const setBareNyMaanedsinntekt = get().setBareNyMaanedsinntekt;
    const slettAlleArbeidsgiverperioder = get().slettAlleArbeidsgiverperioder;
    const slettBruttoinntekt = get().slettBruttoinntekt;
    const setEndringsaarsak = get().setEndringsaarsak;
    const setOpprinneligNyMaanedsinntekt = get().setOpprinneligNyMaanedsinntekt;
    const initRefusjonskravetOpphoerer = get().initRefusjonskravetOpphoerer;
    const bestemmendeFravaersdag = get().bestemmendeFravaersdag;

    const refusjon = forespurtData?.refusjon?.forslag;
    const inntekt = forespurtData?.inntekt?.forslag;
    const arbeidsgiverperiodePaakrevd = forespurtData?.arbeidsgiverperiode?.paakrevd;

    if (!arbeidsgiverperiodePaakrevd) {
      let refusjonerUtenOpprinneligBfd = refusjon?.perioder
        ? perioderEksklBestemmendeFravaersdag(refusjon, inntekt?.forrigeInntekt?.skjæringstidspunkt)
        : refusjon?.perioder;

      const harEndringer = sjekkHarEndring(refusjon, bestemmendeFravaersdag);
      const refusjonsbeloep = finnRefusjonIArbeidsgiverperioden(refusjon, inntekt?.forrigeInntekt?.skjæringstidspunkt);

      settRefusjonsbeloep(refusjonsbeloep, harEndringer);

      const refusjonPerioder = refusjon ? [...refusjon.perioder] : [];
      const opphoersdatoRefusjon = refusjon?.opphoersdato || null;

      const refusjonskravetOpphoererStatus: YesNo | undefined = opphoersdatoRefusjon ? 'Ja' : 'Nei';

      refusjonerUtenOpprinneligBfd = refusjonerUtenOpprinneligBfd ? refusjonerUtenOpprinneligBfd : [];
      initRefusjonskravetOpphoerer(
        refusjonskravetOpphoererStatus,
        opphoersdatoRefusjon ? parseIsoDate(opphoersdatoRefusjon) : undefined,
        refusjonerUtenOpprinneligBfd.length > 0 ? 'Ja' : 'Nei'
      );

      const refusjonEndringer: Array<EndringsBeloep> = refusjonPerioderTilRefusjonEndringer(refusjonPerioder);

      initRefusjonEndringer(refusjonEndringer);

      if (typeof inntekt?.forrigeInntekt?.beløp === 'number') {
        setBareNyMaanedsinntekt(inntekt.forrigeInntekt.beløp);
        setOpprinneligNyMaanedsinntekt();
      } else {
        slettBruttoinntekt();
        setEndringsaarsak(begrunnelseEndringBruttoinntekt.Feilregistrert);
      }

      slettAlleArbeidsgiverperioder();
    }

    set(
      produce((state: ForespurtDataState) => {
        state.forespurtData = forespurtData;

        settInntektsdataForrigeInnsending();

        return state;

        function settInntektsdataForrigeInnsending() {
          if (inntekt?.forrigeInntekt) {
            const fastsattInntekt = inntekt.forrigeInntekt.beløp;

            if (typeof fastsattInntekt === 'number') {
              state.fastsattInntekt = fastsattInntekt;
              state.gammeltSkjaeringstidspunkt = parseISO(inntekt.forrigeInntekt.skjæringstidspunkt);
              state.ukjentInntekt = false;
            }
          } else {
            state.fastsattInntekt = undefined;
            state.gammeltSkjaeringstidspunkt = undefined;
            state.ukjentInntekt = true;
          }
        }
      })
    );

    function settRefusjonsbeloep(beloep: number, harEndringer: YesNo | undefined) {
      initLonnISykefravaeret({
        status: harEndringer,
        beloep: beloep ?? 0
      });
    }
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

    if (forespurtData) {
      return Object.keys(forespurtData).filter(
        (key) => forespurtData[key as keyof typeof forespurtData].paakrevd === true
      ) as Array<Opplysningstype>;
    } else if (paakrevdeOpplysninger) {
      return paakrevdeOpplysninger;
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
        state.fastsattInntekt = inntekt.beløp;
        state.gammeltSkjaeringstidspunkt = parseISO(inntekt.skjæringstidspunkt);

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
  arbeidsgiverRefusjonskravHarEndringer: () => {
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

function sjekkHarEndring(
  refusjon: (ForslagInntekt & ForslagRefusjon) | undefined,
  bestemmendeFravaersdag: Date | undefined
): YesNo | undefined {
  if (refusjon?.opphoersdato === null && refusjon?.perioder.length === 0) {
    return 'Nei';
  }

  const perioderEksklusiveBestemmendeFravaersdagHvisIngenBeløp = refusjon?.perioder.filter((periode) => {
    return parseIsoDate(periode.fom) !== bestemmendeFravaersdag && periode.beloep !== 0;
  });

  if (
    refusjon?.opphoersdato ||
    (perioderEksklusiveBestemmendeFravaersdagHvisIngenBeløp &&
      perioderEksklusiveBestemmendeFravaersdagHvisIngenBeløp.length > 0)
  ) {
    return 'Ja';
  }

  if (refusjon) {
    return 'Nei';
  }

  const perioderEksklusiveBestemmendeFravaersdag = perioderEksklBestemmendeFravaersdag(
    refusjon,
    bestemmendeFravaersdag
  );
  return perioderEksklusiveBestemmendeFravaersdag && perioderEksklusiveBestemmendeFravaersdag.length > 0 ? 'Ja' : 'Nei';
}

function perioderEksklBestemmendeFravaersdag(
  refusjon: ForslagInntekt & ForslagRefusjon,
  bestemmendeFravaersdag?: TDateISODate
) {
  return refusjon?.perioder.filter((periode) => {
    return periode.fom !== bestemmendeFravaersdag;
  });
}

function refusjonPerioderTilRefusjonEndringer(perioder: MottattPeriodeRefusjon[]): EndringsBeloep[] {
  return perioder.map((periode: MottattPeriodeRefusjon) => {
    return {
      dato: periode.fom ? parseISO(periode.fom) : undefined,
      beloep: ugyldigEllerNegativtTall(periode.beloep) ? undefined : periode.beloep
    };
  });
}

function finnRefusjonIArbeidsgiverperioden(
  refusjon: (ForslagInntekt & ForslagRefusjon) | undefined,
  skjaeringstidspunkt: TDateISODate | undefined
): number {
  if (!refusjon) {
    return 0;
  }

  if (!skjaeringstidspunkt) {
    return 0;
  }

  const refusjonIAGP = refusjon.perioder.find((periode) => {
    return periode.fom === skjaeringstidspunkt;
  });

  return refusjonIAGP?.beloep || 0;
}
