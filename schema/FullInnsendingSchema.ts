import { z } from 'zod';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';

const FullInnsendingSchema = InnsendingSchema.extend({
  forespoerselId: z.string().uuid(),
  avsenderTlf: TelefonNummerSchema
}).superRefine(superRefineInnsending);

export default FullInnsendingSchema;
