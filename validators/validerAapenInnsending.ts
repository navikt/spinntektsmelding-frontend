import { z } from 'zod/v4';

import { EndringAarsakSchema } from '../schema/EndringAarsakSchema';
import { RefusjonEndringSchema } from '../schema/ApiRefusjonEndringSchema';
import AapenInnsendingSchema from '../schema/AapenInnsendingSchema';

export type AapenInnsending = z.infer<typeof AapenInnsendingSchema>;

export default function validerAapenInnsending(data: Partial<AapenInnsending>) {
  return AapenInnsendingSchema.safeParse(data);
}

export type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export type RefusjonEndring = z.infer<typeof RefusjonEndringSchema>;
