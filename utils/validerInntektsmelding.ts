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
import { CompleteState } from '../state/useBoundStore';
import valdiderEndringAvMaanedslonn, { EndringAvMaanedslonnFeilkode } from '../validators/validerEndringAvMaanedslonn';
import validerTelefon, { TelefonFeilkode } from '../validators/validerTelefon';
import validerPeriodeFravaer, { PeriodeFravaerFeilkode } from '../validators/validerPeriodeFravaer';
import validerPeriodeOverlapp, { PeriodeOverlappFeilkode } from '../validators/validerPeriodeOverlapp';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { z } from 'zod';
import finnBestemmendeFravaersdag from './finnBestemmendeFravaersdag';
import { finnFravaersperioder } from '../state/useEgenmeldingStore';
import parseIsoDate from './parseIsoDate';

interface SubmitInntektsmeldingReturnvalues {
  valideringOK: boolean;
  errorTexts?: Array<ValiderTekster>;
}

export interface ValiderTekster {
  felt: string;
  text: string;
}

export interface ValiderResultat {
  felt: string;
  code: codeUnion;
}

enum ErrorCodes {
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
  | PeriodeFravaerFeilkode
  | TelefonFeilkode
  | PeriodeOverlappFeilkode;

type Skjema = z.infer<typeof HovedskjemaSchema>;

export default function validerInntektsmelding(
  state: CompleteState,
  opplysningerBekreftet: boolean,
  kunInntektOgRefusjon: boolean,
  formData: Skjema
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
  let feilkoderTelefon: Array<ValiderResultat> = [];

  state.setSkalViseFeilmeldinger(true);

  if (state.sykmeldingsperioder) {
    if (state.sykmeldingsperioder.length < 1) {
      errorCodes.push({
        felt: '',
        code: ErrorCodes.INGEN_FRAVAERSPERIODER
      });
    }

    feilkoderFravaersperioder = validerPeriode(state.sykmeldingsperioder);
  } else {
    errorCodes.push({
      felt: '',
      code: ErrorCodes.INGEN_FRAVAERSPERIODER
    });
  }

  const sykmeldingsperioder = finnFravaersperioder(state.sykmeldingsperioder, state.egenmeldingsperioder);

  let kreverAgp = true;
  if (state.forespurtData?.arbeidsgiverperiode.paakrevd === false) {
    kreverAgp = false;
  }

  const kreverInntekt = state.forespurtData?.inntekt.paakrevd;

  const bestemmendeFravaersdag = kreverAgp
    ? parseIsoDate(
        finnBestemmendeFravaersdag(
          sykmeldingsperioder,
          state.arbeidsgiverperioder,
          state.foreslaattBestemmendeFravaersdag,
          !state.skjaeringstidspunkt
        )
      )
    : parseIsoDate(state.forespurtData?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt);

  if (state.egenmeldingsperioder && state.egenmeldingsperioder.length > 0 && !kunInntektOgRefusjon) {
    feilkoderEgenmeldingsperioder = validerPeriodeEgenmelding(state.egenmeldingsperioder, 'egenmeldingsperioder');
  }

  feilkoderBruttoinntekt = validerBruttoinntekt(state, formData, bestemmendeFravaersdag!);

  if (state.naturalytelser) {
    feilkoderNaturalytelser = validerNaturalytelser(
      formData.inntekt?.naturalytelser,
      formData.inntekt?.harBortfallAvNaturalytelser
    );
  }

  if (!kunInntektOgRefusjon) {
    feilkoderLonnIArbeidsgiverperioden = validerLonnIArbeidsgiverPerioden(
      state.fullLonnIArbeidsgiverPerioden,
      state.arbeidsgiverperioder,
      formData.inntekt?.beloep
    );
  }

  feilkoderLonnUnderSykefravaeret = validerLonnUnderSykefravaeret(
    state.lonnISykefravaeret,
    formData.inntekt?.beloep,
    kreverInntekt
  );

  feilkoderEndringAvMaanedslonn = valdiderEndringAvMaanedslonn(
    state.harRefusjonEndringer,
    state.refusjonEndringer,
    state.lonnISykefravaeret,
    formData.inntekt?.beloep,
    state.refusjonskravetOpphoerer?.opphoersdato
  );

  feilkoderBekreftOpplyninger = validerBekreftOpplysninger(opplysningerBekreftet);

  if (state.arbeidsgiverperioder && !kunInntektOgRefusjon) {
    feilkoderArbeidsgiverperioder = validerPeriodeFravaer(state.arbeidsgiverperioder, 'arbeidsgiverperioder');
    const feilkoderOverlapp = validerPeriodeOverlapp(state.arbeidsgiverperioder);

    if (feilkoderOverlapp.length > 0) {
      feilkoderArbeidsgiverperioder = [...feilkoderArbeidsgiverperioder, ...feilkoderOverlapp];
    }
  }

  feilkoderTelefon = validerTelefon(formData.avsenderTlf);

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
}
