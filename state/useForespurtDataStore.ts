import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { parseISO } from 'date-fns';
import { YesNo } from './state';
import { MottattPeriodeRefusjon, TDateISODate } from './MottattData';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import skjemaVariant from '../config/skjemavariant';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';

export type Opplysningstype = (typeof skjemaVariant)[keyof typeof skjemaVariant];

// type Beregningsmåneder = `${number}-${number}`;

type FourDigitString = string & { length: 4 } & { [Symbol.match](string: string): RegExpMatchArray | null };

type Beregningsmåneder = `${
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
  | '12'}-${FourDigitString}`;

type OpplysningstypeInntekt = 'ForslagInntektFastsatt' | 'ForslagInntektGrunnlag';

type ForrigeInntekt = {
  skjæringstidspunkt: TDateISODate;
  kilde: 'INNTEKTSMELDING' | 'AAREG';
  beløp: number;
};

type ForslagInntekt = {
  type: OpplysningstypeInntekt;
  beregningsmåneder?: Beregningsmåneder;
  forrigeInntekt?: ForrigeInntekt;
};

type ForslagRefusjon = {
  opphoersdato: TDateISODate | null;
  perioder: Array<MottattPeriodeRefusjon>;
  refundert?: number;
};

type ForespurtData = {
  paakrevd: boolean;
  forslag: ForslagInntekt & ForslagRefusjon;
};

type MottattForespurtData = {
  [key in Opplysningstype]: ForespurtData;
};

export interface ForespurtDataState {
  forespurtData?: MottattForespurtData;
  refusjonTilArbeidsgiver?: number;
  fastsattInntekt?: number;
  ukjentInntekt: boolean;
  ukjentRefusjon: boolean;
  gammeltSkjaeringstidspunkt?: Date;
  paakrevdeOpplysninger?: Array<Opplysningstype>;
  initForespurtData: (forespurtData: MottattForespurtData) => void;
  hentOpplysningstyper: () => Array<Opplysningstype>;
  hentPaakrevdOpplysningstyper: () => Array<Opplysningstype>;
  setPaakrevdeOpplysninger: (paakrevdeOpplysninger: Array<Opplysningstype>) => void;
  setTidligereInntektsdata: (inntekt: ForrigeInntekt) => void;
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  ukjentInntekt: false,
  ukjentRefusjon: false,
  forespurtData: undefined,
  initForespurtData: (forespurtData) => {
    const refusjonskravetOpphoererStatus = get().refusjonskravetOpphoererStatus;
    const refusjonskravetOpphoererDato = get().refusjonskravetOpphoererDato;
    const initRefusjonEndringer = get().initRefusjonEndringer;
    const setHarRefusjonEndringer = get().setHarRefusjonEndringer;
    const initLonnISykefravaeret = get().initLonnISykefravaeret;
    const setNyMaanedsinntektBlanktSkjema = get().setNyMaanedsinntektBlanktSkjema;
    const slettAlleArbeidsgiverperioder = get().slettAlleArbeidsgiverperioder;
    const slettBruttoinntekt = get().slettBruttoinntekt;
    const setEndringsaarsak = get().setEndringsaarsak;

    const refusjon = forespurtData?.refusjon?.forslag;
    const inntekt = forespurtData?.inntekt?.forslag;
    const arbeidsgiverperiodePaakrevd = forespurtData?.arbeidsgiverperiode?.paakrevd;

    if (!arbeidsgiverperiodePaakrevd) {
      let kravOpphorer: YesNo = jaEllerNei(refusjon);
      let kravOpphorerDato = refusjon?.opphoersdato;

      refusjonskravetOpphoererDato(parseISO(kravOpphorerDato as string));

      refusjonskravetOpphoererStatus(kravOpphorer);

      const refusjonsbelop = finnRefusjonIArbeidsgiverperioden(refusjon, inntekt?.forrigeInntekt?.skjæringstidspunkt);

      settRefusjonsbelop(refusjonsbelop);

      const opphoersdatoRefusjon = finnOpphoersdatoRefusjon(refusjon);

      if (opphoersdatoRefusjon) {
        refusjonskravetOpphoererDato(parseISO(opphoersdatoRefusjon));
        refusjonskravetOpphoererStatus('Ja');

        refusjon.perioder = refusjon.perioder.filter((periode) => {
          return periode.fom !== opphoersdatoRefusjon;
        });
      } else {
        refusjonskravetOpphoererDato(undefined);
        refusjonskravetOpphoererStatus('Nei');
      }

      const harEndringer = sjekkHarEndring(refusjon);

      if (refusjonsbelop) setHarRefusjonEndringer(harEndringer);

      const refusjonEndringer: Array<EndringsBelop> = refusjonPerioderTilRefusjonEndringer(refusjon);

      initRefusjonEndringer(refusjonEndringer);

      if (inntekt.forrigeInntekt?.beløp) {
        setNyMaanedsinntektBlanktSkjema(inntekt.forrigeInntekt.beløp);
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

        if (!forespurtData.refusjon?.forslag) {
          state.ukjentRefusjon = true;
        }

        return state;

        function settInntektsdataForrigeInnsending() {
          if (inntekt.forrigeInntekt) {
            const fastsattInntekt = inntekt.forrigeInntekt.beløp;

            if (fastsattInntekt) {
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

    function settRefusjonsbelop(refusjonsbelop: number) {
      if (refusjonsbelop) {
        initLonnISykefravaeret({
          status: 'Ja',
          belop: refusjonsbelop
        });

        refusjon.perioder = refusjon.perioder.filter((periode) => {
          return periode.fom !== inntekt?.forrigeInntekt?.skjæringstidspunkt;
        });
      } else {
        initLonnISykefravaeret({
          status: 'Nei',
          belop: 0
        });

        setHarRefusjonEndringer(undefined);
      }
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
  }
});

export default useForespurtDataStore;

function jaEllerNei(refusjon: ForslagInntekt & ForslagRefusjon): YesNo {
  return refusjon?.opphoersdato ? 'Ja' : 'Nei';
}

function sjekkHarEndring(refusjon: ForslagInntekt & ForslagRefusjon): YesNo {
  return refusjon?.perioder && refusjon?.perioder.length > 0 ? 'Ja' : 'Nei';
}

function refusjonPerioderTilRefusjonEndringer(refusjon: ForslagInntekt & ForslagRefusjon): EndringsBelop[] {
  return refusjon?.perioder.map((periode: MottattPeriodeRefusjon) => {
    return {
      dato: periode.fom ? parseISO(periode.fom) : undefined,
      belop: periode.beloep || undefined
    };
  });
}

function finnRefusjonIArbeidsgiverperioden(
  refusjon: ForslagInntekt & ForslagRefusjon,
  skjaeringstidspunkt: TDateISODate | undefined
): number {
  if (!skjaeringstidspunkt) {
    return 0;
  }

  const refusjonIAGP = refusjon.perioder.find((periode) => {
    return periode.fom === skjaeringstidspunkt;
  });

  return refusjonIAGP?.beloep || 0;
}

function finnOpphoersdatoRefusjon(refusjon: ForslagInntekt & ForslagRefusjon): TDateISODate | null {
  if (!refusjon || !refusjon.perioder) {
    return null;
  }

  const maxDato = refusjon?.perioder.reduce((prev, current) => {
    return prev.fom > current.fom ? prev : current;
  }, {} as MottattPeriodeRefusjon);

  return !maxDato.beloep ? maxDato.fom : null;
}
