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
import { CompleteState } from '../state/useBoundStore';
import valdiderEndringAvMaanedslonn, { EndringAvMaanedslonnFeilkode } from '../validators/validerEndringAvMaanedslonn';
// import validerTelefon, { TelefonFeilkode } from '../validators/validerTelefon';
import validerPeriodeFravaer, { PeriodeFravaerFeilkode } from '../validators/validerPeriodeFravaer';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
import valideringDelvisInnsendingSchema from '../schema/valideringDelvisInnsendingSchema';
import { z } from 'zod';

export interface SubmitInntektsmeldingReturnvalues {
  valideringOK: boolean;
  errorTexts?: Array<ValiderTekster>;
}

interface ValiderTekster {
  felt: string;
  text: string;
}

enum ErrorCodes {
  INGEN_ARBEIDSFORHOLD = 'INGEN_ARBEIDSFORHOLD',
  INGEN_FRAVAERSPERIODER = 'INGEN_FRAVAERSPERIODER',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN = 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN',
  INGEN_LONN_I_SYKEFRAVAERET = 'INGEN_LONN_I_SYKEFRAVAERET'
}

type codeUnion =
  | PeriodeFeilkode
  | ErrorCodes
  | FullLonnIArbeidsgiverPerioden
  | FullLonnISykefravaeret
  | NaturalytelserFeilkoder
  | LonnIArbeidsgiverperiodenFeilkode
  | LonnUnderSykefravaeretFeilkode
  | BekreftOpplysningerFeilkoder
  | EndringAvMaanedslonnFeilkode
  | PeriodeEgenmeldingFeilkode
  | PeriodeFravaerFeilkode;

interface ValiderResultat {
  felt: string;
  code: codeUnion;
}

type Skjema = z.infer<typeof valideringDelvisInnsendingSchema>;

export default function validerDelvisInntektsmelding(
  state: CompleteState,
  opplysningerBekreftet: boolean,
  kunInntektOgRefusjon: boolean,
  forespurtData: ForespurtData,
  form: Skjema
): SubmitInntektsmeldingReturnvalues {
  let errorTexts: Array<ValiderTekster> = [];
  let errorCodes: Array<ValiderResultat> = [];
  // let feilkoderFravaersperioder: Array<ValiderResultat> = [];
  let feilkoderEgenmeldingsperioder: Array<ValiderResultat> = [];
  let feilkoderBruttoinntekt: Array<ValiderResultat> = [];
  let feilkoderNaturalytelser: Array<ValiderResultat> = [];
  let feilkoderLonnIArbeidsgiverperioden: Array<ValiderResultat> = [];
  let feilkoderLonnUnderSykefravaeret: Array<ValiderResultat> = [];
  let feilkoderBekreftOpplyninger: Array<ValiderResultat> = [];
  let feilkoderEndringAvMaanedslonn: Array<ValiderResultat> = [];
  let feilkoderArbeidsgiverperioder: Array<ValiderResultat> = [];

  state.setSkalViseFeilmeldinger(true);

  // if (state.fravaersperioder) {
  //   if (state.fravaersperioder.length < 1) {
  //     errorCodes.push({
  //       felt: '',
  //       code: ErrorCodes.INGEN_FRAVAERSPERIODER
  //     });
  //   }

  //   feilkoderFravaersperioder = validerPeriode(state.fravaersperioder);
  // } else {
  //   errorCodes.push({
  //     felt: '',
  //     code: ErrorCodes.INGEN_FRAVAERSPERIODER
  //   });
  // }

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
  console.log(
    'validering',
    { beloep: form.refusjon.refusjonPrMnd, status: form.refusjon.kreverRefusjon },
    { status: form.refusjon.kravetOpphoerer, opphoersdato: form.refusjon.refusjonOpphoerer },
    form.bruttoInntekt ?? forespurtData.bruttoinntekt
  );

  feilkoderLonnUnderSykefravaeret = validerLonnUnderSykefravaeret(
    { beloep: form.refusjon.refusjonPrMnd, status: form.refusjon.kreverRefusjon },
    { status: form.refusjon.kravetOpphoerer, opphoersdato: form.refusjon.refusjonOpphoerer },
    form.bruttoInntekt ?? forespurtData.bruttoinntekt
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
    // ...feilkoderFravaersperioder,
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
