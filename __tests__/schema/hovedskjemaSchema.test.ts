import { describe, it, expect } from 'vitest';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';

describe('HovedskjemaSchema', () => {
  it('should pass validation when all fields are correct', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 1234.5,
        endringAarsaker: null,
        harBortfallAvNaturalytelser: false,
        naturalytelser: []
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail validation when bekreft_opplysninger is false', () => {
    const schemaData = {
      bekreft_opplysninger: false,
      inntekt: {
        beloep: 1234.5,
        endringAarsaker: null
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Du må bekrefte at opplysningene er riktige før du kan sende inn.',
        path: ['bekreft_opplysninger']
      },
      {
        code: 'invalid_type',
        expected: 'boolean',
        message: 'Invalid input: expected boolean, received undefined',
        path: ['inntekt', 'harBortfallAvNaturalytelser']
      }
    ]);
  });

  it('should fail validation when beloep is missing', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        endringAarsaker: null
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        message: 'Vennligst fyll inn beløpet for inntekt.',
        path: ['inntekt', 'beloep']
      },
      {
        code: 'invalid_type',
        expected: 'boolean',
        message: 'Invalid input: expected boolean, received undefined',
        path: ['inntekt', 'harBortfallAvNaturalytelser']
      }
    ]);
  });

  it('should fail validation when beloep is negative', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: -100,
        endringAarsaker: null
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should pass validation when inntekt is optional and not provided', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
  });

  it('should fail validation when two endringAarsaker are identical', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: [{ aarsak: 'Bonus' }, { aarsak: 'Bonus' }]
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should not fail validation when endringAarsaker is an empty array', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: []
      },
      avsenderTlf: '12345678'
    };
    const status = HovedskjemaSchema.safeParse(schemaData);
    expect(status.error).toBeUndefined();
    expect(status.success).toBe(true);
  });

  it('should not fail validation when two endringAarsaker are not identical', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: [{ aarsak: 'Bonus' }, { aarsak: 'Ferietrekk' }]
      },
      avsenderTlf: '12345678'
    };
    const status = HovedskjemaSchema.safeParse(schemaData);
    expect(status.error).toBeUndefined();
    expect(status.success).toBe(true);
  });

  it('should not fail validation when endringAarsaker is null', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      avsenderTlf: '12345678'
    };
    const status = HovedskjemaSchema.safeParse(schemaData);
    expect(status.success).toBe(true);
  });

  it('should not fail validation when endringAarsaker is undefined', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: undefined
      },
      avsenderTlf: '12345678'
    };
    const status = HovedskjemaSchema.safeParse(schemaData);
    expect(status.success).toBe(false);
    expect(status.error).toBeTruthy();
    expect(status.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'invalid_type',
              expected: 'array',
              message: 'Invalid input: expected array, received undefined',
              path: []
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Invalid input: expected null, received undefined',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['inntekt', 'endringAarsaker']
      }
    ]);
  });

  it('should fail validation when the endringAarsaker object is empty.', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: [{}]
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'custom',
              error: 'Vennligst angi årsak til endringen.',
              fatal: true,
              message: 'Invalid input',
              path: ['0', 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Invalid input: expected null, received array',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['inntekt', 'endringAarsaker']
      }
    ]);
  });

  it('should fail validation when the endringAarsaker aarsak is an empty string.', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: [{ aarsak: '' }]
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'custom',
              error: 'Vennligst angi årsak til endringen.',
              fatal: true,
              message: 'Invalid input',
              path: ['0', 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Invalid input: expected null, received array',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['inntekt', 'endringAarsaker']
      }
    ]);
    // expect(result.error?.errors[0].message).toBe('Invalid input');
    // expect(result.error?.errors[0].path).toEqual(['inntekt', 'endringAarsaker']);
  });

  it('should fail validation when the endringAarsaker aarsak is undefined.', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 100,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: [{ aarsak: undefined }]
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'custom',
              error: 'Vennligst angi årsak til endringen.',
              fatal: true,
              message: 'Invalid input',
              path: ['0', 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Invalid input: expected null, received array',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['inntekt', 'endringAarsaker']
      }
    ]);
  });
});
