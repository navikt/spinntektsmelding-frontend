import { Periode } from '../../state/state';
import validerPeriodeEgenmelding from '../../validators/validerPeriodeEgenmelding';
import { expect, it, describe } from 'vitest';

describe('validerPeriodeEgenmelding', () => {
  it('should validate that all is OK', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        tom: new Date(2002, 9, 10),
        fom: new Date(2002, 9, 1)
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual([]);
  });

  it('should fail if tom is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fom: new Date()
      }
    ];

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'tom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if fom is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        tom: new Date()
      }
    ];

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'fom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if tom and fom is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        tom: new Date(2002, 9, 10),
        fom: new Date(2002, 9, 1)
      },
      {
        id: 'tilfeldig'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'fom-tilfeldig'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'tom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if tom and fom is missing on the first item', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig'
      },
      {
        id: 'tilfeldig',
        tom: new Date(2002, 9, 10),
        fom: new Date(2002, 9, 1)
      }
    ];

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'fom-tilfeldig'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'tom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if fom and tom is in the wrong order', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fom: new Date(2002, 9, 10),
        tom: new Date(2002, 9, 1)
      }
    ];

    const expected = [
      {
        code: 'TIL_FOR_FRA',
        felt: 'fom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail periode is missing', () => {
    const input: Array<Periode> = [];

    const expected = [
      {
        code: 'MANGLER_PERIODE',
        felt: 'backend'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if periode is more than 16 days', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fom: new Date(2002, 9, 1),
        tom: new Date(2002, 9, 17)
      }
    ];

    const expected = [
      {
        code: 'FOR_MANGE_DAGER_I_PERIODE',
        felt: 'fom-tilfeldig'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });

  it('should fail if more than 16 days between periodes', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fom: new Date(2002, 9, 1),
        tom: new Date(2002, 9, 10)
      },
      {
        id: 'tilfeldig2',
        fom: new Date(2002, 10, 1),
        tom: new Date(2002, 10, 10)
      }
    ];

    const expected = [
      {
        code: 'FOR_MANGE_DAGER_MELLOM',
        felt: 'fom-tilfeldig2'
      }
    ];

    expect(validerPeriodeEgenmelding(input)).toEqual(expected);
  });
});
