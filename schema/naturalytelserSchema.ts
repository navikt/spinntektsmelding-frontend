import z from 'zod';
import { NaturalytelseEnum } from './NaturalytelseEnum';

const naturalytelserSchema = z.object({
  naturalytelse: NaturalytelseEnum,
  verdiBeloep: z.number({ required_error: 'Vennligst fyll inn beløpet.' }).min(0),
  sluttdato: z.date({ required_error: 'Vennligst fyll inn dato.' })
});

export default naturalytelserSchema;
