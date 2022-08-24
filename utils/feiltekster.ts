// import { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
// import { FullLonnIArbeidsgiverPerioden } from '../validators/validerFullLonnIArbeidsgiverPerioden';
// import { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
// import { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';
// import { PeriodeFeilkode } from '../validators/validerPeriode';
// import { ErrorCodes } from './submitInntektsmelding';

const feiltekster = {
  INGEN_ARBEIDSFORHOLD: 'Mangler arbeidsforhold.',
  INGEN_FRAVAERSPERIODER: 'Mangler fraværsperiode.',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN: 'Velg om full lønn betales i arbeidsgiverperioden.',
  INGEN_LONN_I_SYKEFRAVAERET: 'Det er ikke registrert lønn.',
  MANGLER_FRA: 'Vennligst angi fra dato.',
  MANGLER_TIL: 'Vennligst angi til dato.',
  IKKE_BEKREFTET: 'Bruttoinntekt er ikke bekreftet.',
  BRUTTOINNTEKT_MANGLER: 'Vennligst anngi bruttoinntekt.',
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER:
    'Angi om arbeidsgiver betaler ut full lønn til arbeidstaker i arbeidsgiverperioden.',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE:
    'Begrunnelse for redusert utbetaling av lønn i arbeidsgiverperioden mangler.',
  LONN_UNDER_SYKEFRAVAERET_MANGLER: 'Angi om arbeidsgiver betaler lønn under hele eller deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_BELOP:
    'Angi refusjonsbeløpet arbeidsgiver har betalt under hele eller deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG: 'Angi om arbeidsgiver betaler lønn under hele elle deler av sykefraværet.',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO: 'Angi siste dato det kreves refusjon for.',
  BEKREFT_OPPLYSNINGER: 'Bekreft at opplysningene gitt er riktig og fullstendige.',
  ENDRINGSAARSAK_MANGLER: 'Vennligst anngi årsak for endringen.',
  SUM_LAVERE_ENN_INNTEKT: 'Summen av inntektene for de enkelte arbeidsforholdene er høyere enn bruttoinntekten.'
};

export default feiltekster;
