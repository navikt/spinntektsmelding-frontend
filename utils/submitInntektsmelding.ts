import InntektsmeldingSkjema from '../state/state';
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
import validerPeriodeEgenmelding from '../validators/validerPeriodeEgenmelding';

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
  | LonnUnderSykefravaeretFeilkode;

export interface ValiderResultat {
  felt: string;
  code: codeUnion;
}

export default function submitInntektsmelding(state: InntektsmeldingSkjema): SubmitInntektsmeldingReturnvalues {
  let errorTexts: Array<ValiderTekster> = [];
  let errorCodes: Array<ValiderResultat> = [];
  let feilkoderFravaersperioder: Array<ValiderResultat> = [];
  let feilkoderEgenmeldingsperioder: Array<ValiderResultat> = [];
  let feilkoderBruttoinntekt: Array<ValiderResultat> = [];
  let feilkoderNaturalytelser: Array<ValiderResultat> = [];
  let feilkoderLonnIArbeidsgiverperioden: Array<ValiderResultat> = [];
  let feilkoderLonnUnderSykefravaeret: Array<ValiderResultat> = [];

  const aktuelleArbeidsforholdId = state.arbeidsforhold
    ?.filter((forhold) => forhold.aktiv === true)
    .map((forhold) => forhold.arbeidsforholdId);

  if (!aktuelleArbeidsforholdId || aktuelleArbeidsforholdId?.length < 1) {
    errorCodes.push({
      felt: '',
      code: ErrorCodes.INGEN_ARBEIDSFORHOLD
    });
  }

  if (state.fravaersperiode) {
    const fravaersperiodeArbeidsforholdKeys = Object.keys(state.fravaersperiode);
    if (fravaersperiodeArbeidsforholdKeys.length < 1) {
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FRAVAERSPERIODER
      });
    }

    feilkoderFravaersperioder = fravaersperiodeArbeidsforholdKeys.flatMap((forhold) =>
      validerPeriode(state.fravaersperiode?.[forhold])
    );
  } else {
    errorCodes.push({
      felt: '',
      code: ErrorCodes.INGEN_FRAVAERSPERIODER
    });
  }

  if (state.egenmeldingsperioder) {
    const egenmeldingsperioderArbeidsforholdKeys = Object.keys(state.egenmeldingsperioder);
    if (egenmeldingsperioderArbeidsforholdKeys.length > 0) {
      feilkoderEgenmeldingsperioder = egenmeldingsperioderArbeidsforholdKeys.flatMap((forhold) =>
        validerPeriodeEgenmelding(state.egenmeldingsperioder[forhold])
      );
    }
  }

  feilkoderBruttoinntekt = validerBruttoinntekt(state.bruttoinntekt);

  if (state.naturalytelser) {
    feilkoderNaturalytelser = validerNaturalytelser(state.naturalytelser, state.hasBortfallAvNaturalytelser);
  }

  feilkoderLonnIArbeidsgiverperioden = validerLonnIArbeidsgiverPerioden(
    state.fullLonnIArbeidsgiverPerioden,
    aktuelleArbeidsforholdId
  );

  feilkoderLonnUnderSykefravaeret = validerLonnUnderSykefravaeret(
    state.lonnISykefravaeret,
    aktuelleArbeidsforholdId,
    state.refusjonskravetOpphoerer
  );

  errorCodes = [
    ...errorCodes,
    ...feilkoderFravaersperioder,
    ...feilkoderEgenmeldingsperioder,
    ...feilkoderBruttoinntekt,
    ...feilkoderNaturalytelser,
    ...feilkoderLonnIArbeidsgiverperioden,
    ...feilkoderLonnUnderSykefravaeret
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
}
