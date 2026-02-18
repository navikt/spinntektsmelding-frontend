import { isValid } from 'date-fns';
import { z } from 'zod';
import { RefusjonEndringSchema } from '../schema/RefusjonEndringSchema';

type EndringsBeloep = z.infer<typeof RefusjonEndringSchema>;
export function harGyldigeRefusjonEndringer(refusjonEndringer: Array<EndringsBeloep> | undefined): boolean {
  return refusjonEndringer && refusjonEndringer.length > 0
    ? refusjonEndringer?.filter(
        (endring) => (endring.startdato && isValid(endring.startdato)) || (endring.beloep && endring.beloep > -1)
      ).length > 0
    : false;
}
