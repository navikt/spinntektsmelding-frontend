import { describe, it, expect } from 'vitest';
import { hovedskjemaSchema } from '../../schema/hovedskjemaSchema';
import { aa } from 'vitest/dist/chunks/reporters.d.CqBhtcTq.js';

describe('hovedskjemaSchema', () => {
  it('should pass validation when all fields are correct', () => {
    const validData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 1234.5,
        endringAarsaker: null,
        harBortfallAvNaturalytelser: false,
        naturalytelser: []
      },
      avsenderTlf: '12345678'
    };
    expect(() => hovedskjemaSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation when bekreft_opplysninger is false', () => {
    const invalidData = {
      bekreft_opplysninger: false,
      inntekt: {
        beloep: 1234.5,
        endringAarsaker: null
      }
    };
    expect(() => hovedskjemaSchema.parse(invalidData)).toThrow(
      'Du må bekrefte at opplysningene er riktige før du kan sende inn.'
    );
  });

  it('should fail validation when beloep is missing', () => {
    const invalidData = {
      bekreft_opplysninger: true,
      inntekt: {
        endringAarsaker: null
      }
    };
    expect(() => hovedskjemaSchema.parse(invalidData)).toThrow('Vennligst fyll inn beløpet for inntekt.');
  });

  it('should fail validation when beloep is negative', () => {
    const invalidData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: -100,
        endringAarsaker: null
      }
    };
    expect(() => hovedskjemaSchema.parse(invalidData)).toThrow();
  });

  it('should pass validation when inntekt is optional and not provided', () => {
    const validData = {
      bekreft_opplysninger: true,
      avsenderTlf: '12345678'
    };
    expect(() => hovedskjemaSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation when two endringAarsaker are identical', () => {
    const invalidData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: -100,
        endringAarsaker: [
          { aarsak: 'Bonus', begrunnelse: 'Test' },
          { aarsak: 'Bonus', begrunnelse: 'Test' }
        ]
      }
    };
    expect(() => hovedskjemaSchema.parse(invalidData)).toThrow();
  });
});
