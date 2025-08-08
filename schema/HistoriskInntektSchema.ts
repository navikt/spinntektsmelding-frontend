import z from 'zod/v4';

export const HistoriskInntektSchema = z.map(z.string(), z.number().nullable());

export type HistoriskInntekt = z.infer<typeof HistoriskInntektSchema>;
