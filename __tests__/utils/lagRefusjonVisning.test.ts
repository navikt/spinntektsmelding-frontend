import { describe, expect, it } from 'vitest';
import { lagRefusjonVisning } from '../../utils/lagRefusjonVisning';
import parseIsoDate from '../../utils/parseIsoDate';

describe('lagRefusjonVisning', () => {
  it.each([undefined, null])('shows no refund when refusjon is %s', (refusjon) => {
    expect(lagRefusjonVisning(refusjon, undefined)).toEqual({
      loenn: { status: 'Nei', beloep: undefined },
      endringer: []
    });
  });

  it.each([0, 1000])('preserves the specified refund amount %s', (beloepPerMaaned) => {
    expect(lagRefusjonVisning({ beloepPerMaaned }, undefined).loenn).toEqual({
      status: 'Ja',
      beloep: beloepPerMaaned
    });
  });

  it.each([undefined, null])('shows no refund when the amount is %s', (beloepPerMaaned) => {
    expect(lagRefusjonVisning({ beloepPerMaaned }, undefined).loenn.status).toBe('Nei');
  });

  it.each(['2024-06-01', new Date(2024, 5, 1, 15)])(
    'keeps changes from and including the determining absence day %s',
    (bestemmendeFravaersdag) => {
      const { endringer } = lagRefusjonVisning(
        {
          beloepPerMaaned: 1000,
          endringer: [
            { startdato: '2024-05-31', beloep: 100 },
            { startdato: '2024-06-01', beloep: 200 },
            { startdato: new Date(2024, 5, 2), beloep: 0 }
          ]
        },
        bestemmendeFravaersdag
      );

      expect(endringer).toEqual([
        { startdato: parseIsoDate('2024-06-01'), beloep: 200 },
        { startdato: parseIsoDate('2024-06-02'), beloep: 0 }
      ]);
    }
  );

  it('keeps all explicit changes when the determining absence day is missing', () => {
    const { endringer } = lagRefusjonVisning(
      { beloepPerMaaned: 1000, endringer: [{ startdato: '2024-05-01', beloep: 0 }] },
      undefined
    );

    expect(endringer).toEqual([{ startdato: parseIsoDate('2024-05-01'), beloep: 0 }]);
  });

  it('does not mutate the source changes', () => {
    const endringer = Object.freeze([Object.freeze({ startdato: '2024-06-01', beloep: 0 })]);

    lagRefusjonVisning({ beloepPerMaaned: 1000, endringer }, '2024-06-01');

    expect(endringer).toEqual([{ startdato: '2024-06-01', beloep: 0 }]);
  });

  it('rejects invalid change dates explicitly', () => {
    expect(() =>
      lagRefusjonVisning({ beloepPerMaaned: 1000, endringer: [{ startdato: 'ugyldig', beloep: 0 }] }, '2024-06-01')
    ).toThrow();
  });

  it('rejects an invalid determining absence day explicitly', () => {
    expect(() => lagRefusjonVisning({ beloepPerMaaned: 0 }, 'ugyldig')).toThrow(
      'Ugyldig bestemmende fraværsdag ved visning av refusjon'
    );
  });
});
