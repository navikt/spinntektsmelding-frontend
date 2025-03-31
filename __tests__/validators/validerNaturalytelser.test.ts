import { Naturalytelse } from '../../state/state';
import validerNaturalytelser from '../../validators/validerNaturalytelser';
import { expect, it, describe } from 'vitest';

describe('validerNaturalytelser', () => {
  it('should validate that all is OK', () => {
    const input: Array<Naturalytelse> = [
      {
        naturalytelse: 'BOLIG',
        sluttdato: new Date(),
        verdiBeloep: 1234
      }
    ];
    expect(validerNaturalytelser(input, true)).toEqual([]);
  });

  it('should fail if sluttdato is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        naturalytelse: 'BOLIG',
        verdiBeloep: 1234
      }
    ];

    const expected = [
      {
        code: 'MANGLER_BORTFALLSDATO',
        felt: 'naturalytelse-dato-BOLIG'
      }
    ];

    expect(validerNaturalytelser(input, true)).toEqual(expected);
  });

  it('should fail if naturalytelse is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        sluttdato: new Date(),
        verdiBeloep: 1234
      }
    ];

    const expected = [
      {
        code: 'MANGLER_TYPE',
        felt: 'naturalytelse-type-undefined'
      }
    ];

    expect(validerNaturalytelser(input, true)).toEqual(expected);
  });

  it('should fail if verdiBeloep is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        sluttdato: new Date(),
        naturalytelse: 'BOLIG'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_VERDI',
        felt: 'naturalytelse-beloep-BOLIG'
      }
    ];

    expect(validerNaturalytelser(input, true)).toEqual(expected);
  });

  it('should not fail if verdiBeloep is missing and we dont expect any naturalytelser', () => {
    const input: Array<Naturalytelse> = [
      {
        sluttdato: new Date(),
        naturalytelse: 'BOLIG'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_VALG_BORTFALL_AV_NATURALYTELSER',
        felt: ''
      },
      {
        code: 'MANGLER_VERDI',
        felt: 'naturalytelse-beloep-BOLIG'
      }
    ];

    expect(validerNaturalytelser(input, undefined)).toEqual(expected);
  });
});
