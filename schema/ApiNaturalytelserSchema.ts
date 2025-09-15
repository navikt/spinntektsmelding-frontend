import { z } from 'zod';
import { NaturalytelseEnumSchema } from './NaturalytelseEnumSchema';

export const ApiNaturalytelserSchema = z.union([
  z.array(
    z.object({
      naturalytelse: NaturalytelseEnumSchema,
      verdiBeloep: z.number().min(0),
      sluttdato: z.iso.date({
        error: (issue) => (issue.input === undefined ? 'Sluttdato mangler' : 'Ugyldig sluttdato')
      })
    })
  ),
  z.tuple([])
]);
