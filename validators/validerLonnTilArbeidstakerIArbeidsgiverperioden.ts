import { LonnIArbeidsgiverperioden } from '../state/state';

export default function validerLonnTilArbeidstakerIArbeidsgiverperioden(
  fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden
): boolean {
  if (fullLonnIArbeidsgiverPerioden === undefined) {
    return false;
  }
  if (fullLonnIArbeidsgiverPerioden.status === 'Nei' && fullLonnIArbeidsgiverPerioden.begrunnelse === undefined) {
    return false;
  }
  return true;
}
