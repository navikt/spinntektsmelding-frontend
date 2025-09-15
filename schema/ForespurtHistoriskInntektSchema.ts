import { z } from 'zod';
import { HistoriskInntektSchema } from './HistoriskInntektSchema';

export const ForespurtHistoriskInntektSchema = z.object({
  gjennomsnitt: z.number(),
  historikk: HistoriskInntektSchema
});
