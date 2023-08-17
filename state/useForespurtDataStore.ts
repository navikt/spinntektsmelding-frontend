import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { parseISO } from 'date-fns';
import { YesNo } from './state';
import { TDateISODate } from './MottattData';
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

type MottattPeriodeRefusjon = {
  fom: string;
  tom: string;
  beløp: number;
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
  skjaeringstidspunkt?: Date;
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

    let kravOpphorer: YesNo = refusjon?.opphoersdato ? 'Ja' : 'Nei';
    let kravOpphorerDato = refusjon?.opphoersdato;

    refusjonskravetOpphoererDato(parseISO(kravOpphorerDato as string));

    refusjonskravetOpphoererStatus(kravOpphorer);

    const harEndringer = refusjon?.perioder && refusjon?.perioder.length > 0;
    setHarRefusjonEndringer(harEndringer ? 'Ja' : 'Nei');

    const refusjonEndringer: Array<EndringsBelop> = refusjonPerioderTilRefusjonEndringer(refusjon);

    const harRefundert = refusjon?.refundert ? 'Ja' : 'Nei';

    initLonnISykefravaeret({
      status: harRefundert,
      belop: refusjon?.refundert
    });

    oppdaterRefusjonEndringer(refusjonEndringer);
    if (inntekt.forrigeInntekt?.beløp) {
      setNyMaanedsinntektBlanktSkjema(inntekt.forrigeInntekt.beløp);
    }

    slettAlleArbeidsgiverperioder();
    set(
      produce((state: ForespurtDataState) => {
        state.forespurtData = forespurtData;
        if (inntekt.forrigeInntekt) {
          const fastsattInntekt = inntekt.forrigeInntekt.beløp;

          if (fastsattInntekt) {
            state.fastsattInntekt = fastsattInntekt;
            state.skjaeringstidspunkt = parseISO(inntekt.forrigeInntekt.skjæringstidspunkt);
          }
        } else {
          state.fastsattInntekt = bruttoinntekt.bruttoInntekt;
          state.skjaeringstidspunkt = undefined;
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
function refusjonPerioderTilRefusjonEndringer(refusjon: ForslagInntekt & ForslagRefusjon): EndringsBelop[] {
  return refusjon?.perioder.map((periode: MottattPeriodeRefusjon) => {
    return {
      dato: periode.fom ? parseISO(periode.fom) : undefined,
      belop: periode.beløp || undefined
    };
  });
}
