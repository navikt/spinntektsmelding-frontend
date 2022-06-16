import { Periode } from '../../state/state';
import validerPerioder from '../../validators/validerPeriode';

describe('validerPeriode', () => {
  it('should validate that all is OK', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        til: new Date(),
        fra: new Date()
      }
    ];
    expect(validerPerioder(input)).toBe(true);
  });

  it('should fail if til is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        fra: new Date()
      }
    ];
    expect(validerPerioder(input)).toBe(false);
  });

  it('should fail if fra is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig',
        til: new Date()
      }
    ];
    expect(validerPerioder(input)).toBe(false);
  });

  it('should fail if til and fra is missing', () => {
    const input: Array<Periode> = [
      {
        id: 'tilfeldig'
      }
    ];
    expect(validerPerioder(input)).toBe(false);
  });
});
