import { z } from 'zod';
import { NaturalytelseEnum } from './NaturalytelseEnum';

export const apiNaturalytelserSchema = z.union([
  z.array(
    z.object({
      naturalytelse: NaturalytelseEnum,
      verdiBeloep: z.number().min(0),
      sluttdato: z.string().date()
    })
  ),
  z.tuple([])
]);
