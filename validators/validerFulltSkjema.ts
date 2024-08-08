import { z } from 'zod';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';

type FullInnsending = z.infer<typeof fullInnsendingSchema>;

export default function validerFulltSkjema(data: Partial<FullInnsending>) {
  return fullInnsendingSchema.safeParse(data);
}
