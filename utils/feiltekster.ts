// import { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
// import { FullLonnIArbeidsgiverPerioden } from '../validators/validerFullLonnIArbeidsgiverPerioden';
// import { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
// import { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';
// import { PeriodeFeilkode } from '../validators/validerPeriode';
import { ErrorCodes } from './submitInntektsmelding';

const feiltekster = {
  INGEN_ARBEIDSFORHOLD: 'Mangler arbeidsforhold',
  INGEN_FRAVAERSPERIODER: 'Mangler fraværsperiode',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN: 'Velg om full lønn betales i arbeidsgiverperioden',
  INGEN_LONN_I_SYKEFRAVAERET: 'Det er ikke registrert lønn',
  MANGLER_FRA: 'Vennligst angi fra dato',
  MANGLER_TIL: 'Vennligst angi til dato',
  IKKE_BEKREFTET: 'Brutto inntekt er ikke bekreftet'
};

export default feiltekster;
