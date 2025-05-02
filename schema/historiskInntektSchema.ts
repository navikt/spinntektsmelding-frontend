import z from 'zod';

export const HistoriskInntektSchema = z.object({
  maaned: z.string(),
  inntekt: z.number().nullable()
});

export type HistoriskInntekt = z.infer<typeof HistoriskInntektSchema>;
