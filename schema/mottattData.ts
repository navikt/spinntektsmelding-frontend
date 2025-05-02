import z from 'zod';
import { dateISODateSchema, mottattForespurtDataSchema, MottattPeriodeSchema } from './forespurtData';
import { FeilReportFeilListeSchema } from './feilReportSchema';
import { HistoriskInntektSchema } from './historiskInntektSchema';

const MottattDataSchema = z.object({
  navn: z.string(),
  identitetsnummer: z.string(),
  orgNavn: z.string(),
  orgnrUnderenhet: z.string(),
  fravaersperioder: z.array(MottattPeriodeSchema),
  egenmeldingsperioder: z.array(MottattPeriodeSchema),
  bruttoinntekt: z.number(),
  tidligereinntekter: z.array(HistoriskInntektSchema),
  innsenderNavn: z.string(),
  telefonnummer: z.string().optional(),
  feilReport: FeilReportFeilListeSchema.optional(),
  forespurtData: mottattForespurtDataSchema.optional(),
  skjaeringstidspunkt: dateISODateSchema, // TODO: Er denne i bruk?
  eksternBestemmendeFravaersdag: dateISODateSchema,
  bestemmendeFravaersdag: dateISODateSchema,
  opprettetUpresisIkkeBruk: dateISODateSchema.optional(),
  erBesvart: z.boolean()
});

export type MottattData = z.infer<typeof MottattDataSchema>;
