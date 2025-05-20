import z from 'zod';
import { dateISODateSchema, mottattForespurtDataSchema, MottattPeriodeSchema } from './ForespurtDataSchema';
import { ForespurtHistoriskInntektSchema } from './ForespurtHistoriskInntektSchema';
import { SykmeldtSchema } from './SykmeldtSchema';
import { AvsenderSchema } from './AvsenderSchema';

const mottattSykmeldt = SykmeldtSchema.extend({
  navn: z.string().nullable()
});

const MottattAvsenderSchema = AvsenderSchema.extend({
  orgNavn: z.string().nullable(),
  navn: z.string().nullable()
});

export const MottattDataSchema = z.object({
  sykmeldt: mottattSykmeldt,
  avsender: MottattAvsenderSchema,
  egenmeldingsperioder: z.array(MottattPeriodeSchema).default([]),
  sykmeldingsperioder: z.array(MottattPeriodeSchema).min(1, 'Sykmeldingsperioder må ha minst en periode.'),
  bestemmendeFravaersdag: dateISODateSchema,
  eksternInntektsdato: dateISODateSchema.nullable(),
  inntekt: ForespurtHistoriskInntektSchema.nullable(),
  ForespurtDataSchema: mottattForespurtDataSchema.optional(),
  erBesvart: z.boolean(),
  telefonnummer: z.string().optional()
});

export type MottattData = z.infer<typeof MottattDataSchema>;
