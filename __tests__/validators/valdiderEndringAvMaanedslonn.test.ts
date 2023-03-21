import { expect, it, describe } from 'vitest';
import valdiderEndringAvMaanedslonn from '../../validators/validerEndringAvMaanedslonn';

describe.concurrent('valdiderEndringAvMaanedslonn', () => {
  it('should return [] when there is no changes', () => {
    expect(valdiderEndringAvMaanedslonn('Nei')).toEqual([]);
  });

  it('should return [] when there are changes', () => {
    expect(valdiderEndringAvMaanedslonn('Ja')).toEqual([]);
  });

  it('should return [] when no params are given', () => {
    expect(valdiderEndringAvMaanedslonn()).toEqual([]);
  });

  it('should return error when harRefusjonEndringer is undefined and lis.status = Ja', () => {
    expect(valdiderEndringAvMaanedslonn(undefined, undefined, { status: 'Ja' })).toEqual([
      { code: 'MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN', felt: 'lus-utbetaling-endring-radio' }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and refusjonEndringer is empty', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{}])).toEqual([
      {
        code: 'MANGLER_BELOP',
        felt: 'lus-utbetaling-endring-belop-0'
      },
      {
        code: 'MANGLER_DATO',
        felt: 'lus-utbetaling-endring-dato-0'
      }
    ]);
  });
});
