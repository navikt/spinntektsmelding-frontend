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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 1234.5,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 1234.5
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 1234.5
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: -100
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should pass validation when inntekt is optional and not provided', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 1234.5,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100
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
              message: 'Vennligst angi årsak til endringen.',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100
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
              code: 'invalid_union',
              discriminator: 'aarsak',
              errors: [],
              message: 'Vennligst angi årsak til endringen.',
              note: 'No matching discriminator',
              path: [0, 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Vennligst angi årsak til endringen.',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100
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
              code: 'invalid_union',
              discriminator: 'aarsak',
              errors: [],
              message: 'Vennligst angi årsak til endringen.',
              note: 'No matching discriminator',
              path: [0, 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Vennligst angi årsak til endringen.',
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
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 100
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
              code: 'invalid_union',
              discriminator: 'aarsak',
              errors: [],
              message: 'Vennligst angi årsak til endringen.',
              note: 'No matching discriminator',
              path: [0, 'aarsak']
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'null',
              message: 'Vennligst angi årsak til endringen.',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['inntekt', 'endringAarsaker']
      }
    ]);
  });

  it('should fail validation when refusjonsbeløpet is higher than inntekt', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 1000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 2000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Refusjonsbeløpet kan ikke være høyere enn inntekten.',
        path: ['refusjon', 'beloepPerMaaned']
      })
    );
  });

  it('should fail validation when harEndringer is Ja but no endringer provided', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Ja',
        endringer: []
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Vennligst legg til minst én endring.',
        path: ['refusjon', 'endringer']
      })
    );
  });

  it('should fail validation when kreverRefusjon is Ja but harEndringer is not set', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Vennligst angi om det er endringer i refusjonsbeløpet i perioden.',
        path: ['refusjon', 'harEndringer']
      })
    );
  });

  it('should fail validation when fullLonn is not set and opplysningstyper includes arbeidsgiverperiode', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      opplysningstyper: ['arbeidsgiverperiode'],
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Velg om full lønn betales i arbeidsgiverperioden.',
        path: ['fullLonn']
      })
    );
  });

  it('should fail validation when fullLonn is Nei but beloep is missing', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      fullLonn: 'Nei',
      agp: {
        redusertLoennIAgp: {
          begrunnelse: 'StreikEllerLockout'
        }
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Beløp utbetalt i arbeidsgiverperioden må fylles ut.',
        path: ['agp', 'redusertLoennIAgp', 'beloep']
      })
    );
  });

  it('should fail validation when fullLonn is Nei but begrunnelse is missing', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      fullLonn: 'Nei',
      agp: {
        redusertLoennIAgp: {
          beloep: 1000
        }
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse']
      })
    );
  });

  it('should fail validation when fullLonn is Nei and beloep is higher than inntekt', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 1000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 500,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      fullLonn: 'Nei',
      agp: {
        redusertLoennIAgp: {
          beloep: 5000,
          begrunnelse: 'StreikEllerLockout'
        }
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        code: 'custom',
        message: 'Utbetalingen under arbeidsgiverperioden kan ikke være høyere enn beregnet månedslønn.',
        path: ['agp', 'redusertLoennIAgp', 'beloep']
      })
    );
  });

  it('should pass validation when fullLonn is Nei and all agp fields are correct', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      fullLonn: 'Nei',
      agp: {
        redusertLoennIAgp: {
          beloep: 2000,
          begrunnelse: 'StreikEllerLockout'
        }
      },
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
  });

  it('should pass validation when harEndringer is Ja and endringer are provided', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Ja',
        endringer: [{ beloep: 2000, startdato: new Date('2024-01-15') }]
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
  });

  it('should pass validation when fullLonn is Ja and opplysningstyper includes arbeidsgiverperiode', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      fullLonn: 'Ja',
      opplysningstyper: ['arbeidsgiverperiode'],
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
  });

  it('should fail validation when refusjon endringer has invalid beloep', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Ja',
        endringer: [{ beloep: -100, dato: new Date('2024-01-15') }]
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should fail validation when refusjon endringer has invalid dato', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Ja',
        endringer: [{ beloep: 2000, startdato: 'invalid-date' }]
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should fail validation when telefonnummer is invalid', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '123'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(false);
  });

  it('should pass validation with naturalytelser', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: true,
        endringAarsaker: null,
        naturalytelser: [
          {
            naturalytelse: 'BIL',
            verdiBeloep: 500,
            sluttdato: new Date('2024-01-15')
          }
        ]
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 3000,
        harEndringer: 'Nei'
      },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
  });

  it('should pass validation with kreverRefusjon Nei', () => {
    const schemaData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 5000,
        harBortfallAvNaturalytelser: false,
        endringAarsaker: null
      },
      refusjon: {
        isEditing: false,
        beloepPerMaaned: 0
      },
      kreverRefusjon: 'Nei',
      avsenderTlf: '12345678'
    };
    const result = HovedskjemaSchema.safeParse(schemaData);
    expect(result.success).toBe(true);
  });
});
