import validerBruttoinntekt, { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
import validerPeriode, { PeriodeFeilkode } from '../validators/validerPeriode';
import { FullLonnIArbeidsgiverPerioden } from '../validators/validerFullLonnIArbeidsgiverPerioden';
import { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
import validerNaturalytelser, { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';
import feiltekster from './feiltekster';
import validerLonnIArbeidsgiverPerioden, {
  LonnIArbeidsgiverperiodenFeilkode
} from '../validators/validerLonnIArbeidsgiverperioden';
import validerLonnUnderSykefravaeret, {
  LonnUnderSykefravaeretFeilkode
} from '../validators/validerLonnUnderSykefravaeret';
import validerPeriodeEgenmelding, { PeriodeEgenmeldingFeilkode } from '../validators/validerPeriodeEgenmelding';
import validerBekreftOpplysninger, { BekreftOpplysningerFeilkoder } from '../validators/validerBekreftOpplysninger';
import useBoundStore from '../state/useBoundStore';
import valdiderEndringAvMaanedslonn, { EndringAvMaanedslonnFeilkode } from '../validators/validerEndringAvMaanedslonn';
import validerTelefon, { TelefonFeilkode } from '../validators/validerTelefon';

export interface SubmitInntektsmeldingReturnvalues {
  valideringOK: boolean;
  errorTexts?: Array<ValiderTekster>;
}

export interface ValiderTekster {
  felt: string;
  text: string;
}

export enum ErrorCodes {
  INGEN_ARBEIDSFORHOLD = 'INGEN_ARBEIDSFORHOLD',
  INGEN_FRAVAERSPERIODER = 'INGEN_FRAVAERSPERIODER',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN = 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN',
  INGEN_LONN_I_SYKEFRAVAERET = 'INGEN_LONN_I_SYKEFRAVAERET'
}

type codeUnion =
  | PeriodeFeilkode
  | BruttoinntektFeilkode
  | ErrorCodes
  | FullLonnIArbeidsgiverPerioden
  | FullLonnISykefravaeret
  | NaturalytelserFeilkoder
  | LonnIArbeidsgiverperiodenFeilkode
  | LonnUnderSykefravaeretFeilkode
  | BekreftOpplysningerFeilkoder
  | EndringAvMaanedslonnFeilkode
  | PeriodeEgenmeldingFeilkode
  | TelefonFeilkode;

export interface ValiderResultat {
  felt: string;
  code: codeUnion;
}

export default function useValiderInntektsmelding() {
  const state = useBoundStore((state) => state);

  return (opplysningerBekreftet: boolean, kunInntektOgRefusjon?: boolean): SubmitInntektsmeldingReturnvalues => {
    let errorTexts: Array<ValiderTekster> = [];
    let errorCodes: Array<ValiderResultat> = [];
    let feilkoderFravaersperioder: Array<ValiderResultat> = [];
    let feilkoderEgenmeldingsperioder: Array<ValiderResultat> = [];
    let feilkoderBruttoinntekt: Array<ValiderResultat> = [];
    let feilkoderNaturalytelser: Array<ValiderResultat> = [];
    let feilkoderLonnIArbeidsgiverperioden: Array<ValiderResultat> = [];
    let feilkoderLonnUnderSykefravaeret: Array<ValiderResultat> = [];
    let feilkoderBekreftOpplyninger: Array<ValiderResultat> = [];
    let feilkoderEndringAvMaanedslonn: Array<ValiderResultat> = [];
    let feilkoderArbeidsgiverperioder: Array<ValiderResultat> = [];
    let feilkoderTelefon: Array<ValiderResultat> = [];

    state.setSkalViseFeilmeldinger(true);

    if (state.fravaersperioder) {
      if (state.fravaersperioder.length < 1) {
        errorCodes.push({
          felt: '',
          code: ErrorCodes.INGEN_FRAVAERSPERIODER
        });
      }

      feilkoderFravaersperioder = validerPeriode(state.fravaersperioder);
    } else {
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FRAVAERSPERIODER
      });
    }

    if (state.egenmeldingsperioder && state.egenmeldingsperioder.length > 0 && !kunInntektOgRefusjon) {
      feilkoderEgenmeldingsperioder = validerPeriodeEgenmelding(state.egenmeldingsperioder, 'egenmeldingsperioder');
    }

    feilkoderBruttoinntekt = validerBruttoinntekt(state);

    if (state.naturalytelser) {
      feilkoderNaturalytelser = validerNaturalytelser(state.naturalytelser, state.hasBortfallAvNaturalytelser);
    }

    if (!kunInntektOgRefusjon) {
      feilkoderLonnIArbeidsgiverperioden = validerLonnIArbeidsgiverPerioden(
        state.fullLonnIArbeidsgiverPerioden,
        state.arbeidsgiverperioder
      );
    }

    feilkoderLonnUnderSykefravaeret = validerLonnUnderSykefravaeret(
      state.lonnISykefravaeret,
      state.refusjonskravetOpphoerer,
      state.bruttoinntekt.bruttoInntekt
    );

    feilkoderEndringAvMaanedslonn = valdiderEndringAvMaanedslonn(
      state.harRefusjonEndringer,
      state.refusjonEndringer,
      state.lonnISykefravaeret,
      state.bruttoinntekt.bruttoInntekt
    );

    feilkoderBekreftOpplyninger = validerBekreftOpplysninger(opplysningerBekreftet);

    if (state.arbeidsgiverperioder && !kunInntektOgRefusjon) {
      feilkoderArbeidsgiverperioder = validerPeriodeEgenmelding(state.arbeidsgiverperioder, 'arbeidsgiverperioder');
    }

    feilkoderTelefon = validerTelefon(state.innsenderTelefonNr);

    errorCodes = [
      ...errorCodes,
      ...feilkoderFravaersperioder,
      ...feilkoderEgenmeldingsperioder,
      ...feilkoderBruttoinntekt,
      ...feilkoderNaturalytelser,
      ...feilkoderLonnIArbeidsgiverperioden,
      ...feilkoderLonnUnderSykefravaeret,
      ...feilkoderBekreftOpplyninger,
      ...feilkoderEndringAvMaanedslonn,
      ...feilkoderArbeidsgiverperioder,
      ...feilkoderTelefon
    ];

    if (errorCodes.length > 0) {
      errorTexts = errorCodes.map((error) => ({
        felt: error.felt,
        // eslint-disable-next-line
        // @ts-ignore
        text: error.code && feiltekster[[error.code]] ? (feiltekster[[error.code]] as string) : error.code
      }));
    }

    return {
      valideringOK: errorCodes.length === 0,
      errorTexts
    };
  };
}
