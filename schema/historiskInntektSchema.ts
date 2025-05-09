import z from 'zod';

export const historiskInntektSchema = z.map(z.string(), z.number().nullable());

export type HistoriskInntekt = z.infer<typeof historiskInntektSchema>;
