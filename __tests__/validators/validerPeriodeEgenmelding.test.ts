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

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual([]);
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
        felt: 'pre[0].tom'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
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
        felt: 'pre[0].fom'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
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
        felt: 'pre[1].fom'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'pre[1].tom'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
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
        felt: 'pre[0].fom'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'pre[0].tom'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
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
        felt: 'pre[0].fom'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
  });

  it('should fail periode is missing', () => {
    const input: Array<Periode> = [];

    const expected = [
      {
        code: 'MANGLER_PERIODE',
        felt: 'backend'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'pre')).toEqual(expected);
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
        felt: 'egenmeldingsperiode-feil'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'egenmeldingsperiode')).toEqual(expected);
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
        felt: 'egenmeldingsperiode-feil'
      }
    ];

    expect(validerPeriodeEgenmelding(input, 'egenmeldingsperiode')).toEqual(expected);
  });
});
