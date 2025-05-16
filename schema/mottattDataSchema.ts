import z from 'zod';
import { dateISODateSchema, mottattForespurtDataSchema, MottattPeriodeSchema } from './forespurtData';
import { forespurtHistoriskInntektSchema } from './forespurtHistoriskInntektSchema';
import { sykmeldtSchema } from './sykmeldtSchema';
import { avsenderSchema } from './avsenderSchema';

const mottattSykmeldt = sykmeldtSchema.extend({
  navn: z.string().nullable()
});

const mottattAvsenderSchema = avsenderSchema.extend({
  orgNavn: z.string().nullable(),
  navn: z.string().nullable()
});

export const mottattDataSchema = z.object({
  sykmeldt: mottattSykmeldt,
  avsender: mottattAvsenderSchema,
  egenmeldingsperioder: z.array(MottattPeriodeSchema).default([]),
  sykmeldingsperioder: z.array(MottattPeriodeSchema).min(1, 'Sykmeldingsperioder må ha minst en periode.'),
  bestemmendeFravaersdag: dateISODateSchema,
  eksternInntektsdato: dateISODateSchema.nullable(),
  inntekt: forespurtHistoriskInntektSchema.nullable(),
  forespurtData: mottattForespurtDataSchema.optional(),
  erBesvart: z.boolean(),
  telefonnummer: z.string().optional()
});

export type MottattData = z.infer<typeof mottattDataSchema>;
