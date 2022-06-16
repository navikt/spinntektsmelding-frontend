import { LonnISykefravaeret } from '../state/state';

export default function validerLonnUnderHeleArbeidsgiverperioden(betalerArbeidsgiver: LonnISykefravaeret): boolean {
  if (!betalerArbeidsgiver) {
    return false;
  }

  if (betalerArbeidsgiver.status === 'Ja') {
    return true;
  }

  if (betalerArbeidsgiver.status === 'Nei' && betalerArbeidsgiver.belop && betalerArbeidsgiver.belop > 0) {
    return true;
  }

  return false;
}
