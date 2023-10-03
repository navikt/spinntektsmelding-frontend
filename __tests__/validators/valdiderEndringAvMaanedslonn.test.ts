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
        felt: 'refusjon.refusjonEndringer[0].beløp'
      },
      {
        code: 'MANGLER_DATO',
        felt: 'refusjon.refusjonEndringer[0].dato'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and belop is negative', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ belop: -1, dato: new Date() }])).toEqual([
      {
        code: 'MANGLER_BELOP',
        felt: 'refusjon.refusjonEndringer[0].beløp'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and belop is a string', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ belop: 'string', dato: new Date() }])).toEqual([
      {
        code: 'MANGLER_BELOP',
        felt: 'refusjon.refusjonEndringer[0].beløp'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and belop higher than bruttoinntekt', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ dato: new Date(), belop: 12345 }], undefined, 555)).toEqual([
      {
        code: 'BELOP_OVERSTIGER_BRUTTOINNTEKT',
        felt: 'refusjon.refusjonEndringer[0].beløp'
      }
    ]);
  });

  it('should not return error when harRefusjonEndringer is Ja and belop lower than bruttoinntekt', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ dato: new Date(), belop: 12345 }], undefined, 55555)).toEqual([]);
  });
});
