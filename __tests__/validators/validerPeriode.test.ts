import { Periode } from '../../state/state';
import validerPerioder from '../../validators/validerPeriode';
import { expect, it, describe } from 'vitest';

describe('validerPeriode', () => {
  it('should validate that all is OK', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        til: new Date(),
        fra: new Date()
      }
    ];

    const expected = [];

    expect(validerPerioder(input)).toEqual(expected);
  });

  it('should fail if til is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fra: new Date()
      }
    ];

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'til-tilfeldig'
      }
    ];

    expect(validerPerioder(input)).toEqual(expected);
  });

  it('should fail if fra is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        til: new Date()
      }
    ];

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'fra-tilfeldig'
      }
    ];

    expect(validerPerioder(input)).toEqual(expected);
  });

  it('should fail if til and fra is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig'
      }
    ];

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'fra-tilfeldig'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'til-tilfeldig'
      }
    ];

    expect(validerPerioder(input)).toEqual(expected);
  });
});
