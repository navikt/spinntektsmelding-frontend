import { z } from 'zod';
import { InnsendingSchema, superRefineInnsending } from './innsendingSchema';
import { isTlfNumber } from '../utils/isTlfNumber';

export const delvisInnsendingSchema = InnsendingSchema.extend({
  avsenderTlf: z
    .string({
      required_error: 'Vennligst fyll inn telefonnummer',
      invalid_type_error: 'Dette er ikke et telefonnummer'
    })
    .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
    .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' })
}).superRefine(superRefineInnsending);
