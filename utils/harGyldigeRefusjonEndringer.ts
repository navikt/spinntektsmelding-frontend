import isValid from 'date-fns/isValid';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';

export function harGyldigeRefusjonEndringer(refusjonEndringer: Array<EndringsBeloep> | undefined): boolean {
  return refusjonEndringer && refusjonEndringer.length > 0
    ? refusjonEndringer?.filter(
        (endring) => (endring.dato && isValid(endring.dato)) || (endring.beloep && endring.beloep > 0)
      ).length > 0
    : false;
}
