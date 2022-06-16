import { Naturalytelse, YesNo } from '../state/state';

export default function validerNaturalytelser(
  naturalytelser: Array<Naturalytelse>,
  hasBortfallAvNaturalytelser: YesNo
): boolean {
  let isValid = true;
  if (hasBortfallAvNaturalytelser === 'Nei') {
    isValid = true;
    return isValid;
  }

  naturalytelser.forEach((ytelse) => {
    if (!ytelse.bortfallsdato) {
      isValid = false;
    }

    if (!ytelse.verdi) {
      isValid = false;
    }

    if (!ytelse.type) {
      isValid = false;
    }
  });
  return isValid;
}
