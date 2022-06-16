import { Naturalytelse } from '../../state/state';
import validerNaturalytelser from '../../validators/validerNaturalytelser';

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
    expect(validerNaturalytelser(input, 'Ja')).toBe(true);
  });

  it('should fail if bortfallsdato is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        type: 'gratis',
        verdi: 1234
      }
    ];
    expect(validerNaturalytelser(input, 'Ja')).toBe(false);
  });

  it('should fail if type is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        verdi: 1234
      }
    ];
    expect(validerNaturalytelser(input, 'Ja')).toBe(false);
  });

  it('should fail if verdi is missing', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        type: 'gratis'
      }
    ];
    expect(validerNaturalytelser(input, 'Ja')).toBe(false);
  });

  it('should not fail if verdi is missing and we dont expect any naturalytelser', () => {
    const input: Array<Naturalytelse> = [
      {
        id: 'tilfeldig',
        bortfallsdato: new Date(),
        type: 'gratis'
      }
    ];
    expect(validerNaturalytelser(input, 'Nei')).toBe(true);
  });
});
