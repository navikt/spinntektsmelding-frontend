import isValid from 'date-fns/isValid';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';

export function harGyldigeRefusjonEndringer(refusjonEndringer: Array<EndringsBelop> | undefined): boolean {
  return refusjonEndringer && refusjonEndringer.length > 0
    ? refusjonEndringer?.filter(
        (endring) => (endring.dato && isValid(endring.dato)) || (endring.beloep && endring.beloep > 0)
      ).length > 0
    : false;
}
