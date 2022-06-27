import InntektsmeldingSkjema from '../state/state';
import validerBruttoinntekt, { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
import validerPeriode, { PeriodeFeilkode } from '../validators/validerPeriode';
import validerFullLonnIArbeidsgiverPerioden, {
  FullLonnIArbeidsgiverPerioden
} from '../validators/validerFullLonnIArbeidsgiverPerioden';
import validerLonnISykefravaeret, { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
import validerNaturalytelser, { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';

interface submitInntektsmeldingReturnvalues {
  valideringOK: boolean;
  errorCodes?: Array<ValiderResultat>;
}

export enum ErrorCodes {
  INGEN_ARBEIDSFORHOLD = 'INGEN_ARBEIDSFORHOLD',
  INGEN_FRAVAERSPERIODER = 'INGEN_FRAVAERSPERIODER',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN = 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN',
  INGEN_LONN_I_SYKEFRAVAERET = 'INGEN_LONN_I_SYKEFRAVAERET'
}

export interface ValiderResultat {
  felt: string;
  code:
    | PeriodeFeilkode
    | BruttoinntektFeilkode
    | ErrorCodes
    | FullLonnIArbeidsgiverPerioden
    | FullLonnISykefravaeret
    | NaturalytelserFeilkoder;
}

export default function submitInntektsmelding(state: InntektsmeldingSkjema): submitInntektsmeldingReturnvalues {
  let valideringOK = true;
  let errorCodes: Array<ValiderResultat> = [];
  let feilkoderFravaersperioder: Array<ValiderResultat> = [];
  let feilkoderEgenmeldingsperioder: Array<ValiderResultat> = [];
  let feilkoderBruttoinntekt: Array<ValiderResultat> = [];
  let feilkoderFullLonnIArbeidsgiverPerioden: Array<ValiderResultat> = [];
  let feilkoderLonnISykefravaeret: Array<ValiderResultat> = [];
  let feilkoderNaturalytelser: Array<ValiderResultat> = [];

  const aktuelleArbeidsforholdId = state.arbeidsforhold
    ?.filter((forhold) => forhold.aktiv === true)
    .map((forhold) => forhold.arbeidsforholdId);

  if (!aktuelleArbeidsforholdId || aktuelleArbeidsforholdId?.length < 1) {
    valideringOK = false;
    errorCodes.push({
      felt: '',
      code: ErrorCodes.INGEN_ARBEIDSFORHOLD
    });
  }

  if (state.fravaersperiode) {
    const fravaersperiodeArbeidsforholdKeys = Object.keys(state.fravaersperiode);
    if (fravaersperiodeArbeidsforholdKeys.length < 1) {
      valideringOK = false;
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FRAVAERSPERIODER
      });
    }

    feilkoderFravaersperioder = fravaersperiodeArbeidsforholdKeys.flatMap((forhold) =>
      validerPeriode(state.fravaersperiode![forhold])
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
        validerPeriode(state.egenmeldingsperioder[forhold])
      );
    }
  }

  feilkoderBruttoinntekt = validerBruttoinntekt(state.bruttoinntekt);

  if (state.fullLonnIArbeidsgiverPerioden) {
    const arbeidsforholdKeys = Object.keys(state.fullLonnIArbeidsgiverPerioden);
    if (arbeidsforholdKeys.length < 1) {
      valideringOK = false;
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN
      });

      if (arbeidsforholdKeys.length > 0) {
        feilkoderFullLonnIArbeidsgiverPerioden = arbeidsforholdKeys.flatMap((forhold) =>
          validerFullLonnIArbeidsgiverPerioden(state.fullLonnIArbeidsgiverPerioden![forhold])
        );
      }
    } else {
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN
      });
    }
  }

  if (state.lonnISykefravaeret) {
    const arbeidsforholdKeys = Object.keys(state.lonnISykefravaeret);
    if (arbeidsforholdKeys.length < 1) {
      valideringOK = false;
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN
      });

      if (arbeidsforholdKeys.length > 0) {
        feilkoderLonnISykefravaeret = arbeidsforholdKeys.flatMap((forhold) =>
          validerLonnISykefravaeret(state.lonnISykefravaeret![forhold])
        );
      }
    } else {
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN
      });
    }
  }

  if (state.naturalytelser) {
    feilkoderNaturalytelser = validerNaturalytelser(state.naturalytelser, state.hasBortfallAvNaturalytelser);
  }

  return {
    valideringOK,
    errorCodes: [
      ...errorCodes,
      ...feilkoderFravaersperioder,
      ...feilkoderEgenmeldingsperioder,
      ...feilkoderBruttoinntekt,
      ...feilkoderFullLonnIArbeidsgiverPerioden,
      ...feilkoderLonnISykefravaeret,
      ...feilkoderNaturalytelser
    ]
  };
}
