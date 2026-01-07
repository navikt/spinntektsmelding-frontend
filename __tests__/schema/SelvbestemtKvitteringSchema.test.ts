import { describe, it, expect } from 'vitest';
import {
  SelvbestemtInntektsmeldingSchema,
  SelvbestemtKvitteringSchema
} from '../../schema/SelvbestemtKvitteringSchema';
import testFnr from '../../mockdata/testFnr';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';

// import { SelvbestemtKvitteringSchema, SelvbestemtInntektsmeldingSchema } from './SelvbestemtKvitteringSchema';

describe('SelvbestemtKvitteringSchema', () => {
  const validSelvbestemtInntektsmelding = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: {
      type: 'Selvbestemt',
      id: '123e4567-e89b-12d3-a456-426614174001'
    },
    sykmeldt: {
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      navn: 'Test Person'
    },
    avsender: {
      orgnr: testOrganisasjoner[0].organizationNumber,
      orgNavn: 'Test Org',
      navn: 'Test Avsender',
      tlf: '12345678'
    },
    sykmeldingsperioder: [
      {
        fom: '2024-01-01',
        tom: '2024-01-15'
      }
    ],
    agp: {
      perioder: [{ fom: '2024-01-01', tom: '2024-01-16' }],
      egenmeldinger: [],
      redusertLoennIAgp: null
    },
    inntekt: {
      beloep: 50000,
      inntektsdato: '2024-01-01',
      naturalytelser: [],
      endringAarsaker: []
    },
    refusjon: {
      beloepPerMaaned: 50000,
      sluttdato: null,
      endringer: []
    },
    naturalytelser: [],
    aarsakInnsending: 'Ny',
    mottatt: '2024-01-15T10:00:00+01:00'
  };

  describe('SelvbestemtInntektsmeldingSchema', () => {
    it('should validate a valid inntektsmelding', () => {
      const result = SelvbestemtInntektsmeldingSchema.safeParse(validSelvbestemtInntektsmelding);
      expect(result.error).toBeUndefined();
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for id', () => {
      const invalid = { ...validSelvbestemtInntektsmelding, id: 'invalid-uuid' };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid aarsakInnsending', () => {
      const invalid = { ...validSelvbestemtInntektsmelding, aarsakInnsending: 'Invalid' };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept Endring as aarsakInnsending', () => {
      const valid = { ...validSelvbestemtInntektsmelding, aarsakInnsending: 'Endring' };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept null for agp', () => {
      const valid = { ...validSelvbestemtInntektsmelding, agp: null };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept null for refusjon', () => {
      const valid = { ...validSelvbestemtInntektsmelding, refusjon: null };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format for mottatt', () => {
      const invalid = { ...validSelvbestemtInntektsmelding, mottatt: '2024-01-15' };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate inntekt with required fields', () => {
      const invalidInntekt = {
        ...validSelvbestemtInntektsmelding,
        inntekt: {
          beloep: 50000
          // missing inntektsdato, naturalytelser, endringAarsaker
        }
      };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalidInntekt);
      expect(result.success).toBe(false);
    });

    it('should validate agp with redusertLoennIAgp', () => {
      const withRedusertLoenn = {
        ...validSelvbestemtInntektsmelding,
        agp: {
          perioder: [{ fom: '2024-01-01', tom: '2024-01-16' }],
          egenmeldinger: [],
          redusertLoennIAgp: {
            beloep: 10000,
            begrunnelse: 'Test begrunnelse'
          }
        }
      };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(withRedusertLoenn);
      expect(result.success).toBe(true);
    });

    it('should reject redusertLoennIAgp with negative beloep', () => {
      const invalid = {
        ...validSelvbestemtInntektsmelding,
        agp: {
          perioder: [{ fom: '2024-01-01', tom: '2024-01-16' }],
          egenmeldinger: [],
          redusertLoennIAgp: {
            beloep: -100,
            begrunnelse: 'Test'
          }
        }
      };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject redusertLoennIAgp with empty begrunnelse', () => {
      const invalid = {
        ...validSelvbestemtInntektsmelding,
        agp: {
          perioder: [{ fom: '2024-01-01', tom: '2024-01-16' }],
          egenmeldinger: [],
          redusertLoennIAgp: {
            beloep: 10000,
            begrunnelse: ''
          }
        }
      };
      const result = SelvbestemtInntektsmeldingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SelvbestemtKvitteringSchema', () => {
    it('should validate a valid kvittering', () => {
      const validKvittering = {
        selvbestemtInntektsmelding: validSelvbestemtInntektsmelding
      };
      const result = SelvbestemtKvitteringSchema.safeParse(validKvittering);
      expect(result.success).toBe(true);
    });

    it('should reject kvittering without selvbestemtInntektsmelding', () => {
      const invalid = {};
      const result = SelvbestemtKvitteringSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject kvittering with invalid selvbestemtInntektsmelding', () => {
      const invalid = {
        selvbestemtInntektsmelding: { id: 'invalid' }
      };
      const result = SelvbestemtKvitteringSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
