import z from 'zod';
import { NaturalytelseEnumSchema } from './NaturalytelseEnumSchema';

const NaturalytelserSchema = z.object({
  naturalytelse: NaturalytelseEnumSchema,
  verdiBeloep: z
    .number({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn beløpet.' : undefined)
    })
    .min(0),
  sluttdato: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn dato.' : undefined)
  })
});

export default NaturalytelserSchema;
