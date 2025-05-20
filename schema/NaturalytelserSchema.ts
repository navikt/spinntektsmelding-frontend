import z from 'zod';
import { NaturalytelseEnumSchema } from './NaturalytelseEnumSchema';

const NaturalytelserSchema = z.object({
  naturalytelse: NaturalytelseEnumSchema,
  verdiBeloep: z.number({ required_error: 'Vennligst fyll inn beløpet.' }).min(0),
  sluttdato: z.date({ required_error: 'Vennligst fyll inn dato.' })
});

export default NaturalytelserSchema;
