import z from 'zod';
import { dateISODateSchema, mottattForespurtDataSchema, MottattPeriodeSchema } from './forespurtData';
import { HistoriskInntektSchema } from './historiskInntektSchema';

export const MottattDataSchema = z.object({
  navn: z.string().nullable(),
  identitetsnummer: z.string(),
  orgNavn: z.string().nullable(),
  orgnrUnderenhet: z.string(),
  fravaersperioder: z.array(MottattPeriodeSchema),
  egenmeldingsperioder: z.array(MottattPeriodeSchema),
  bruttoinntekt: z.number(),
  tidligereinntekter: z.array(HistoriskInntektSchema).nullable(),
  innsenderNavn: z.string(),
  telefonnummer: z.string().optional(),
  forespurtData: mottattForespurtDataSchema.optional(),
  eksternBestemmendeFravaersdag: dateISODateSchema,
  bestemmendeFravaersdag: dateISODateSchema,
  opprettetUpresisIkkeBruk: dateISODateSchema.optional(),
  erBesvart: z.boolean()
});

export type MottattData = z.infer<typeof MottattDataSchema>;
