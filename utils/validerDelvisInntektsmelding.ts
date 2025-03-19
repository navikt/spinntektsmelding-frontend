import validerPeriode from '../validators/validerPeriode';
import validerNaturalytelser from '../validators/validerNaturalytelser';
import feiltekster from './feiltekster';
import validerLonnIArbeidsgiverPerioden from '../validators/validerLonnIArbeidsgiverperioden';
import validerLonnUnderSykefravaeret from '../validators/validerLonnUnderSykefravaeret';
import validerPeriodeEgenmelding from '../validators/validerPeriodeEgenmelding';
import validerBekreftOpplysninger from '../validators/validerBekreftOpplysninger';
import { CompleteState } from '../state/useBoundStore';
import valdiderEndringAvMaanedslonn from '../validators/validerEndringAvMaanedslonn';
import validerPeriodeFravaer from '../validators/validerPeriodeFravaer';
import { ValiderResultat, ValiderTekster } from './validerInntektsmelding';

export interface SubmitInntektsmeldingReturnvalues {
  valideringOK: boolean;
  errorTexts?: Array<ValiderTekster>;
}

enum ErrorCodes {
  INGEN_ARBEIDSFORHOLD = 'INGEN_ARBEIDSFORHOLD',
  INGEN_FRAVAERSPERIODER = 'INGEN_FRAVAERSPERIODER',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN = 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN',
  INGEN_LONN_I_SYKEFRAVAERET = 'INGEN_LONN_I_SYKEFRAVAERET'
}

export default function validerDelvisInntektsmelding(
  state: CompleteState,
  opplysningerBekreftet: boolean,
  kunInntektOgRefusjon?: boolean
): SubmitInntektsmeldingReturnvalues {
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
    feilkoderArbeidsgiverperioder = validerPeriodeFravaer(state.arbeidsgiverperioder, 'arbeidsgiverperioder');
  }

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
    ...feilkoderArbeidsgiverperioder
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
