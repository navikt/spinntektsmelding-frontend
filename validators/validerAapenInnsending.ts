import { z } from 'zod';

import { EndringAarsakSchema } from '../schema/endringAarsakSchema';
import { RefusjonEndringSchema } from '../schema/apiRefusjonEndringSchema';
import aapenInnsendingSchema from '../schema/aapenInnsendingSchema';

export type AapenInnsending = z.infer<typeof aapenInnsendingSchema>;

export default function validerAapenInnsending(data: Partial<AapenInnsending>) {
  return aapenInnsendingSchema.safeParse(data);
}

export type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export type RefusjonEndring = z.infer<typeof RefusjonEndringSchema>;
