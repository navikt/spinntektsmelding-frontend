import { describe, it, expect } from 'vitest';
import { MottattDataSchema } from '../../schema/MottattDataSchema';
import testFnr from '../../mockdata/testFnr';
import { z } from 'zod';

type MottattData = z.infer<typeof MottattDataSchema>;

const baseValid: MottattData = {
  sykmeldt: {
    navn: 'Ola Nordmann',
    fnr: testFnr.GyldigeFraDolly.TestPerson1
  },
  avsender: {
    orgnr: '810007842',
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
  eksternInntektsdato: '2023-02-01',
  bestemmendeFravaersdag: '2023-03-01',
  erBesvart: true
};

describe('MottattDataSchema', () => {
  it('should pass when telefonnummer is omitted', () => {
    const { success, error } = MottattDataSchema.safeParse(baseValid);
    expect(error).toBeUndefined();
    expect(success).toBe(true);
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
    expect(success).toBe(false);
    // expect(error).toBeUndefined();
    expect(error?.issues[0].path).toEqual(['telefonnummer']);
    expect(error?.issues[0].message).toContain('Telefonnummeret er for kort, det må være 8 siffer');
    expect(parsed?.telefonnummer).toBeUndefined();
  });

  it('should fail when telefonnummer is the wrong type', () => {
    const data = { ...(baseValid as any), telefonnummer: 123456 };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['telefonnummer']);
      expect(result.error.issues[0].message).toContain('Dette er ikke et telefonnummer');
    }
  });

  it('shold allow inntekt to be null', () => {
    const data = { ...baseValid, inntekt: null };
    const { success, error } = MottattDataSchema.safeParse(data);
    expect(success).toBe(true);
    expect(error).toBeUndefined();
  });
  it('should fail when inntekt is the wrong type', () => {
    const data = { ...baseValid, inntekt: 123456 };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['inntekt']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected object, received number');
    }
  });
  it('should fail when inntekt is missing gjennomsnitt', () => {
    const data = { ...baseValid, inntekt: { historikk: new Map() } };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['inntekt', 'gjennomsnitt']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected number, received undefined');
    }
  });
  it('should fail when inntekt is missing historikk', () => {
    const data = { ...baseValid, inntekt: { gjennomsnitt: 50000 } };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['inntekt', 'historikk']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected map, received undefined');
    }
  });
  it('should fail when inntekt is missing gjennomsnitt and historikk', () => {
    const data = { ...baseValid, inntekt: {} };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['inntekt', 'gjennomsnitt']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected number, received undefined');
    }
  });
  it('should fail when sykmeldingsperioder is not an array', () => {
    const data = { ...baseValid, sykmeldingsperioder: 'not an array' };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected array, received string');
    }
  });
  it('should fail when egenmeldingsperioder is not an array', () => {
    const data = { ...baseValid, egenmeldingsperioder: 'not an array' };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['egenmeldingsperioder']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected array, received string');
    }
  });
  it('should fail when sykmeldingsperioder is an empty array', () => {
    const data = { ...baseValid, sykmeldingsperioder: [] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder']);
      expect(result.error.issues[0].message).toContain('Sykmeldingsperioder må ha minst en periode.');
    }
  });
  it('should not fail when egenmeldingsperioder is an empty array', () => {
    const data = { ...baseValid, egenmeldingsperioder: [] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
  it('should fail when sykmeldingsperioder is an array of invalid objects', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: 'invalid date', tom: 'invalid date' }] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.issues[0].message).toContain('Invalid ISO date');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with missing fom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ tom: '2023-01-31' }] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected string, received undefined');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with missing tom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: '2023-01-01' }] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder', 0, 'tom']);
      expect(result.error.issues[0].message).toContain('Invalid input: expected string, received undefined');
    }
  });
  it('should fail when sykmeldingsperioder is an array of objects with invalid fom and tom', () => {
    const data = { ...baseValid, sykmeldingsperioder: [{ fom: 'invalid date', tom: 'invalid date' }] };
    const result = MottattDataSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sykmeldingsperioder', 0, 'fom']);
      expect(result.error.issues[0].message).toContain('Invalid ISO date');
      expect(result.error.issues[1].path).toEqual(['sykmeldingsperioder', 0, 'tom']);
      expect(result.error.issues[1].message).toContain('Invalid ISO date');
    }
  });
});
