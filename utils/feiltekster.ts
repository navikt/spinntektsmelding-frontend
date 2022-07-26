// import { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
// import { FullLonnIArbeidsgiverPerioden } from '../validators/validerFullLonnIArbeidsgiverPerioden';
// import { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
// import { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';
// import { PeriodeFeilkode } from '../validators/validerPeriode';
import { ErrorCodes } from './submitInntektsmelding';

const feiltekster = {
  INGEN_ARBEIDSFORHOLD: 'Mangler arbeidsforhold.',
  INGEN_FRAVAERSPERIODER: 'Mangler fraværsperiode.',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN: 'Velg om full lønn betales i arbeidsgiverperioden.',
  INGEN_LONN_I_SYKEFRAVAERET: 'Det er ikke registrert lønn.',
  MANGLER_FRA: 'Vennligst angi fra dato.',
  MANGLER_TIL: 'Vennligst angi til dato.',
  IKKE_BEKREFTET: 'Brutto inntekt er ikke bekreftet.',
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER:
    'Angi om arbeidsgiver betaler ut full lønn til arbeidstaker i arbeidsgiverperioden.',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE:
    'Begrunnelse for redusert utbetaling av lønn i arbeidsgiverperioden mangler.',
  LONN_UNDER_SYKEFRAVAERET_MANGLER: 'Angi om arbeidsgiver betaler lønn under hele eller deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_BELOP:
    'Angi refusjonsbeløpet arbeidsgiver har betalt under hele eller deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG: 'Angi om arbeidsgiver betaler lønn under hele elle deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO: 'Angi siste dato det kreves refusjon for.'
};

export default feiltekster;
