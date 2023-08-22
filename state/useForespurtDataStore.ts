import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { parseISO } from 'date-fns';
import { YesNo } from './state';
import { MottattPeriodeRefusjon, TDateISODate } from './MottattData';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';

export type Opplysningstype = 'inntekt' | 'refusjon' | 'arbeidsgiverperiode';

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
  gammeltSkjaeringstidspunkt?: Date;
  initForespurtData: (forespurtData: MottattForespurtData) => void;
  hentOpplysningstyper: () => Array<Opplysningstype>;
  hentPaakrevdOpplysningstyper: () => Array<Opplysningstype> | Array<undefined>;
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  forespurtData: undefined,
  initForespurtData: (forespurtData) => {
    const refusjonskravetOpphoererStatus = get().refusjonskravetOpphoererStatus;
    const refusjonskravetOpphoererDato = get().refusjonskravetOpphoererDato;
    const oppdaterRefusjonEndringer = get().oppdaterRefusjonEndringer;
    const setHarRefusjonEndringer = get().setHarRefusjonEndringer;
    const initLonnISykefravaeret = get().initLonnISykefravaeret;
    const setNyMaanedsinntektBlanktSkjema = get().setNyMaanedsinntektBlanktSkjema;
    const slettAlleArbeidsgiverperioder = get().slettAlleArbeidsgiverperioder;
    const bruttoinntekt = get().bruttoinntekt;

    const refusjon = forespurtData?.refusjon?.forslag;
    const inntekt = forespurtData?.inntekt?.forslag;
    const arbeidsgiverperiodePaakrevd = forespurtData?.arbeidsgiverperiode?.paakrevd;

    if (!arbeidsgiverperiodePaakrevd) {
      let kravOpphorer: YesNo = refusjon?.opphoersdato ? 'Ja' : 'Nei';
      let kravOpphorerDato = refusjon?.opphoersdato;

      refusjonskravetOpphoererDato(parseISO(kravOpphorerDato as string));

      refusjonskravetOpphoererStatus(kravOpphorer);

      const harEndringer = sjekkForEndringer(refusjon);

      setHarRefusjonEndringer(harEndringer);

      const refusjonEndringer: Array<EndringsBelop> = refusjonPerioderTilRefusjonEndringer(refusjon);

      const harRefundert = sjekkOmRefundert(refusjon);

      initLonnISykefravaeret({
        status: harRefundert,
        belop: refusjon?.refundert
      });

      oppdaterRefusjonEndringer(refusjonEndringer);
      if (inntekt.forrigeInntekt?.beløp) {
        setNyMaanedsinntektBlanktSkjema(inntekt.forrigeInntekt.beløp);
      }

      slettAlleArbeidsgiverperioder();
    }

    set(
      produce((state: ForespurtDataState) => {
        state.forespurtData = forespurtData;
        if (!arbeidsgiverperiodePaakrevd) {
          if (inntekt.forrigeInntekt) {
            const fastsattInntekt = inntekt.forrigeInntekt.beløp;

            if (fastsattInntekt) {
              state.fastsattInntekt = fastsattInntekt;
              state.gammeltSkjaeringstidspunkt = parseISO(inntekt.forrigeInntekt.skjæringstidspunkt);
            }
          } else {
            state.fastsattInntekt = bruttoinntekt.bruttoInntekt;
            state.gammeltSkjaeringstidspunkt = undefined;
          }
        }
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
    if (forespurtData) {
      return Object.keys(forespurtData).filter(
        (key) => forespurtData[key as keyof typeof forespurtData].paakrevd === true
      ) as Array<Opplysningstype>;
    }

    return [];
  }
});

export default useForespurtDataStore;

function sjekkOmRefundert(refusjon: ForslagInntekt & ForslagRefusjon): YesNo {
  return refusjon?.refundert ? 'Ja' : 'Nei';
}

function sjekkForEndringer(refusjon: ForslagInntekt & ForslagRefusjon): YesNo {
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
