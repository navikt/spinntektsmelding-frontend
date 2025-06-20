import { z } from 'zod';
import { NaturalytelseEnumSchema } from './NaturalytelseEnumSchema';

export const ApiNaturalytelserSchema = z.union([
  z.array(
    z.object({
      naturalytelse: NaturalytelseEnumSchema,
      verdiBeloep: z.number().min(0),
      sluttdato: z
        .string({
          required_error: 'Sluttdato mangler',
          invalid_type_error: 'Ugyldig sluttdato'
        })
        .date()
    })
  ),
  z.tuple([])
]);
