import z from 'zod/v4';
import { DateISODateSchema, MottattForespurtDataSchema, MottattPeriodeSchema } from './ForespurtDataSchema';
import { ForespurtHistoriskInntektSchema } from './ForespurtHistoriskInntektSchema';
import { SykmeldtSchema } from './SykmeldtSchema';
import { AvsenderSchema } from './AvsenderSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';

const MottattSykmeldtSchema = SykmeldtSchema.extend({
  navn: z.string().nullable()
});

const MottattAvsenderSchema = AvsenderSchema.extend({
  orgNavn: z.string().nullable(),
  navn: z.string().nullable()
});

export const MottattDataSchema = z.object({
  sykmeldt: MottattSykmeldtSchema,
  avsender: MottattAvsenderSchema,
  egenmeldingsperioder: z.array(MottattPeriodeSchema).prefault([]),
  sykmeldingsperioder: z.array(MottattPeriodeSchema).min(1, 'Sykmeldingsperioder må ha minst en periode.'),
  bestemmendeFravaersdag: DateISODateSchema,
  eksternInntektsdato: DateISODateSchema.nullable(),
  inntekt: ForespurtHistoriskInntektSchema.nullable(),
  forespurtData: MottattForespurtDataSchema.optional(),
  erBesvart: z.boolean(),
  telefonnummer: TelefonNummerSchema.optional(),
  begrensetForespoersel: z.boolean().optional()
});

export type MottattData = z.infer<typeof MottattDataSchema>;
