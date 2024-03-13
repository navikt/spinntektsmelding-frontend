import { Naturalytelse } from '../../state/state';
import validerNaturalytelser from '../../validators/validerNaturalytelser';
import { expect, it, describe } from 'vitest';

describe('validerNaturalytelser', () => {
  it('should validate that all is OK', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        type: 'gratis',
        bortfallsdato: new Date(),
        verdi: 1234
      }
    ];
    expect(validerNaturalytelser(input, 'Ja')).toEqual([]);
  });

  it('should fail if bortfallsdato is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        type: 'gratis',
        verdi: 1234
      }
    ];

    const expected = [
      {
        code: 'MANGLER_BORTFALLSDATO',
        felt: 'naturalytelse-dato-tilfeldig'
      }
    ];

    expect(validerNaturalytelser(input, 'Ja')).toEqual(expected);
  });

  it('should fail if type is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        verdi: 1234
      }
    ];

    const expected = [
      {
        code: 'MANGLER_TYPE',
        felt: 'naturalytelse-type-tilfeldig'
      }
    ];

    expect(validerNaturalytelser(input, 'Ja')).toEqual(expected);
  });

  it('should fail if verdi is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        type: 'gratis'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_VERDI',
        felt: 'naturalytelse-beloep-tilfeldig'
      }
    ];

    expect(validerNaturalytelser(input, 'Ja')).toEqual(expected);
  });

  it('should not fail if verdi is missing and we dont expect any naturalytelser', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        type: 'gratis'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_VALG_BORTFALL_AV_NATURALYTELSER',
        felt: ''
      },
      {
        code: 'MANGLER_VERDI',
        felt: 'naturalytelse-beloep-tilfeldig'
      }
    ];

    expect(validerNaturalytelser(input, 'Nei')).toEqual(expected);
  });
});
