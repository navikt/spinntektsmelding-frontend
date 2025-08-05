import { z } from 'zod/v4';
import { isTlfNumber } from '../utils/isTlfNumber';

export const TelefonNummerSchema = z
  .string({
    error: (iss) => {
      if (iss.code === 'invalid_type') {
        return 'Dette er ikke et telefonnummer';
      }
      if (iss.code === 'required') {
        return 'Vennligst fyll inn telefonnummer';
      }

      return 'Ugyldig telefonnummer';
    }
  })
  .min(8, { error: 'Telefonnummeret er for kort, det må være 8 siffer' })
  .refine((val) => isTlfNumber(val), { error: 'Telefonnummeret er ikke gyldig' });
