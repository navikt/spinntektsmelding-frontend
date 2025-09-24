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
      { code: 'MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN', felt: 'refusjon.endringer' }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and refusjonEndringer is empty', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{}])).toEqual([
      {
        code: 'DUPLISERT_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
        felt: 'refusjon.endringer'
      },
      {
        code: 'MANGLER_BELOP',
        felt: 'refusjon.endringer.0.beloep'
      },
      {
        code: 'MANGLER_DATO',
        felt: 'refusjon.endringer.0.startdato'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and beloep is negative', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ beloep: -1, dato: new Date() }])).toEqual([
      {
        code: 'MANGLER_BELOP',
        felt: 'refusjon.endringer.0.beloep'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and beloep is a string', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ beloep: 'string', dato: new Date() }])).toEqual([
      {
        code: 'MANGLER_BELOP',
        felt: 'refusjon.endringer.0.beloep'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and beloep higher than bruttoinntekt', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ dato: new Date(), beloep: 12345 }], undefined, 555, true)).toEqual([
      {
        code: 'BELOP_OVERSTIGER_BRUTTOINNTEKT',
        felt: 'refusjon.endringer.0.beloep'
      }
    ]);
  });

  it('should not return error when harRefusjonEndringer is Ja and beloep lower than bruttoinntekt', () => {
    expect(valdiderEndringAvMaanedslonn('Ja', [{ dato: new Date(), beloep: 12345 }], undefined, 55555)).toEqual([]);
  });

  it('should not return error when harRefusjonEndringer is Ja and endringsdato is before sluttdoato', () => {
    expect(
      valdiderEndringAvMaanedslonn('Ja', [{ beloep: 12345, dato: new Date(2024, 5, 5) }], undefined, undefined)
    ).toEqual([]);
  });

  it('should return error when harRefusjonEndringer is Ja and duplicated refusjonEndringer', () => {
    const tid = new Date(2024, 5, 5);
    expect(
      valdiderEndringAvMaanedslonn(
        'Ja',
        [
          { dato: tid, beloep: 12345 },
          { dato: tid, beloep: 12345 }
        ],
        undefined,
        55500
      )
    ).toEqual([
      {
        code: 'DUPLISERT_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
        felt: 'refusjon.endringer'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and duplicated refusjonEndringer dates', () => {
    const tid = new Date(2024, 5, 5);
    expect(
      valdiderEndringAvMaanedslonn(
        'Ja',
        [
          { dato: tid, beloep: 12345 },
          { dato: tid, beloep: 1234 }
        ],
        undefined,
        55500
      )
    ).toEqual([
      {
        code: 'DUPLISERT_DATO_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
        felt: 'refusjon.endringer'
      }
    ]);
  });

  it('should return error when harRefusjonEndringer is Ja and duplicated refusjonEndringer dates, even with a unique date in the mix', () => {
    const tid = new Date(2024, 5, 5);
    const tid2 = new Date(2024, 5, 6);
    expect(
      valdiderEndringAvMaanedslonn(
        'Ja',
        [
          { dato: tid, beloep: 12345 },
          { dato: tid, beloep: 1234 },
          { dato: tid2, beloep: 1234 }
        ],
        undefined,
        55500
      )
    ).toEqual([
      {
        code: 'DUPLISERT_DATO_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
        felt: 'refusjon.endringer'
      }
    ]);
  });
});
