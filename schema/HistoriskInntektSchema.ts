import z from 'zod';

export const HistoriskInntektSchema = z.map(z.string(), z.number().nullable());

export type HistoriskInntekt = z.infer<typeof HistoriskInntektSchema>;
