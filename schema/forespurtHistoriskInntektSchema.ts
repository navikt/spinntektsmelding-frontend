import z from 'zod';

export const forespurtHistoriskInntektSchema = z.object({
  gjennomsnitt: z.number(),
  historikk: z.map(z.string(), z.number().nullable())
});
