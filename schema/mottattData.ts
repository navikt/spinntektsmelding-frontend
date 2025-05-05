import z from 'zod';
import { dateISODateSchema, mottattForespurtDataSchema, MottattPeriodeSchema } from './forespurtData';
import { FeilReportFeilListeSchema } from './feilReportSchema';
import { HistoriskInntektSchema } from './historiskInntektSchema';

const MottattDataSchema = z.object({
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
  // feilReport: FeilReportFeilListeSchema.optional(), // TODO: Fjernes!
  forespurtData: mottattForespurtDataSchema.optional(),
  skjaeringstidspunkt: dateISODateSchema, // TODO: Er denne i bruk?
  eksternBestemmendeFravaersdag: dateISODateSchema,
  bestemmendeFravaersdag: dateISODateSchema,
  opprettetUpresisIkkeBruk: dateISODateSchema.optional(),
  erBesvart: z.boolean()
});

export type MottattData = z.infer<typeof MottattDataSchema>;
