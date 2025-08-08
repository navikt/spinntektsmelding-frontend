import { z } from 'zod/v4';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';

const FullInnsendingSchema = InnsendingSchema.extend({
  forespoerselId: z.uuid(),
  avsenderTlf: TelefonNummerSchema
}).superRefine(superRefineInnsending);

export default FullInnsendingSchema;
