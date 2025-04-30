import { z } from 'zod';

export const DatafeltEnum = z.enum([
  'virksomhet',
  'arbeidstaker-informasjon',
  'forespoersel-svar',
  'inntekt',
  'personer'
]);

export type Datafelt = z.infer<typeof DatafeltEnum>;

export const FeilReportElementSchema = z.object({
  melding: z.string(),
  datafelt: DatafeltEnum
});

export type FeilReportElement = z.infer<typeof FeilReportElementSchema>;

export const FeilReportFeilListeSchema = z.object({
  feil: z.array(FeilReportElementSchema)
});

export type FeilReportFeilListe = z.infer<typeof FeilReportFeilListeSchema>;
