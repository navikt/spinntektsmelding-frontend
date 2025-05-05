import { describe, it, expect } from 'vitest';
import { MottattDataSchema } from '../../schema/mottattDataSchema';

const baseValid = {
  navn: 'Ola Nordmann',
  identitetsnummer: '12345678901',
  orgNavn: null,
  orgnrUnderenhet: '987654321',
  fravaersperioder: [],
  egenmeldingsperioder: [],
  bruttoinntekt: 50000,
  tidligereinntekter: null,
  innsenderNavn: 'Kari Tester',
  eksternBestemmendeFravaersdag: '2023-02-01',
  bestemmendeFravaersdag: '2023-03-01',
  erBesvart: true
};

describe('MottattDataSchema', () => {
  it('should pass when telefonnummer is omitted', () => {
    const { success, error } = MottattDataSchema.safeParse(baseValid);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
  });

  it('should pass when telefonnummer is a non-empty string', () => {
    const data = { ...baseValid, telefonnummer: '+4712345678' };
    const { success, data: parsed, error } = MottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
    expect(parsed?.telefonnummer).toBe('+4712345678');
  });

  it('should pass when telefonnummer is an empty string', () => {
    const data = { ...baseValid, telefonnummer: '' };
    const { success, data: parsed, error } = MottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
    expect(parsed?.telefonnummer).toBe('');
  });

  it('should fail when telefonnummer is the wrong type', () => {
    const data = { ...(baseValid as any), telefonnummer: 123456 };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['telefonnummer']);
      expect(result.error.errors[0].message).toContain('Expected string');
    }
  });
});
