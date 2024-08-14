import { z } from 'zod';
import { isTlfNumber } from '../utils/isTlfNumber';

export const TelefonNummerSchema = z
  .string({
    required_error: 'Vennligst fyll inn telefonnummer',
    invalid_type_error: 'Dette er ikke et telefonnummer'
  })
  .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
  .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' });
