import { describe, it, expect } from 'vitest';
import { mottattDataSchema } from '../../schema/mottattDataSchema';
import testFnr from '../../mockdata/testFnr';
import { z } from 'zod';

type MottattData = z.infer<typeof mottattDataSchema>;

const baseValid: MottattData = {
  sykmeldt: {
    navn: 'Ola Nordmann',
    fnr: testFnr.GyldigeFraDolly.TestPerson1
  },
  avsender: {
    orgnr: '987654321',
    navn: 'Kari Tester',
    orgNavn: 'Test AS'
  },
  sykmeldingsperioder: [
    {
      fom: '2023-01-01',
      tom: '2023-01-31'
    },
    {
      fom: '2023-02-01',
      tom: '2023-02-28'
    },
    {
      fom: '2023-03-01',
      tom: '2023-03-31'
    }
  ],
  egenmeldingsperioder: [],
  inntekt: {
    gjennomsnitt: 50000,
    historikk: new Map([
      ['2023-01', 50000],
      ['2023-02', 50000],
      ['2023-03', 50000]
    ])
  },
  eksternBestemmendeFravaersdag: '2023-02-01',
  bestemmendeFravaersdag: '2023-03-01',
  erBesvart: true
};

describe('mottattDataSchema', () => {
  it('should pass when telefonnummer is omitted', () => {
    const { success, error } = mottattDataSchema.safeParse(baseValid);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
  });

  it('should pass when telefonnummer is a non-empty string', () => {
    const data = { ...baseValid, telefonnummer: '+4712345678' };
    const { success, data: parsed, error } = mottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
    expect(parsed?.telefonnummer).toBe('+4712345678');
  });

  it('should pass when telefonnummer is an empty string', () => {
    const data = { ...baseValid, telefonnummer: '' };
    const { success, data: parsed, error } = mottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
    expect(parsed?.telefonnummer).toBe('');
  });

  it('should fail when telefonnummer is the wrong type', () => {
    const data = { ...(baseValid as any), telefonnummer: 123456 };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['telefonnummer']);
      expect(result.error.errors[0].message).toContain('Expected string');
    }
  });

  it('shold allow inntekt to be null', () => {
    const data = { ...baseValid, inntekt: null };
    const { success, error } = mottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
  });
  it('should fail when inntekt is the wrong type', () => {
    const data = { ...baseValid, inntekt: 123456 };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['inntekt']);
      expect(result.error.errors[0].message).toContain('Expected object');
    }
  });
  it('should fail when inntekt is missing gjennomsnitt', () => {
    const data = { ...baseValid, inntekt: { historikk: new Map() } };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['inntekt', 'gjennomsnitt']);
      expect(result.error.errors[0].message).toContain('Required');
    }
  });
  it('should fail when inntekt is missing historikk', () => {
    const data = { ...baseValid, inntekt: { gjennomsnitt: 50000 } };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['inntekt', 'historikk']);
      expect(result.error.errors[0].message).toContain('Required');
    }
  });
  it('should fail when inntekt is missing gjennomsnitt and historikk', () => {
    const data = { ...baseValid, inntekt: {} };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['inntekt', 'gjennomsnitt']);
      expect(result.error.errors[0].message).toContain('Required');
    }
  });
  it('should fail when sykmeldingsperioder is not an array', () => {
    const data = { ...baseValid, sykmeldingsperioder: 'not an array' };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder']);
      expect(result.error.errors[0].message).toContain('Expected array');
    }
  });
  it('should fail when egenmeldingsperioder is not an array', () => {
    const data = { ...baseValid, egenmeldingsperioder: 'not an array' };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['egenmeldingsperioder']);
      expect(result.error.errors[0].message).toContain('Expected array');
    }
  });
  it('should fail when sykmeldingsperioder is an empty array', () => {
    const data = { ...baseValid, sykmeldingsperioder: [] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder']);
      expect(result.error.errors[0].message).toContain('Sykmeldingsperioder må ha minst en periode.');
    }
  });
  it('should not fail when egenmeldingsperioder is an empty array', () => {
    const data = { ...baseValid, egenmeldingsperioder: [] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
  it('should fail when sykmeldingsperioder is an array of invalid objects', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: 'invalid date', tom: 'invalid date' }] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.errors[0].message).toContain('Invalid date');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with missing fom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ tom: '2023-01-31' }] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.errors[0].message).toContain('Required');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with missing tom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: '2023-01-01' }] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder', 0, 'tom']);
      expect(result.error.errors[0].message).toContain('Required');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with invalid fom and tom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: 'invalid date', tom: 'invalid date' }] };
    const result = mottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.errors[0].message).toContain('Invalid date');
      expect(result.error.errors[1].path).toEqual(['sykmeldingsperioder', 0, 'tom']);
      expect(result.error.errors[1].message).toContain('Invalid date');
    }
  });
});
