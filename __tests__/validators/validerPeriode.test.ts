import { Periode } from '../../state/state';
import validerPerioder from '../../validators/validerPeriode';
import { expect, it, describe } from 'vitest';

describe('validerPeriode', () => {
  it('should validate that all is OK', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        tom: new Date(2002, 10, 1),
        fom: new Date(2002, 9, 1)
      }
    ];

    expect(validerPerioder(input)).toEqual([]);
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

    expect(validerPerioder(input)).toEqual(expected);
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

    expect(validerPerioder(input)).toEqual(expected);
  });

  it('should fail if tom and fom is missing', () => {
    const input: Array<Periode> = [
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

    expect(validerPerioder(input)).toEqual(expected);
  });

  it('should fail if fom and tom is in the wrong order', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fom: new Date(2002, 10, 1),
        tom: new Date(2002, 9, 1)
      }
    ];

    const expected = [
      {
        code: 'TIL_FOR_FRA',
        felt: 'fom-tilfeldig'
      }
    ];

    expect(validerPerioder(input)).toEqual(expected);
  });
});
