import { z } from 'zod';
import delvisInnsendingSchema from '../../schema/delvisInnsendingSchema';
import { YesNo } from '../../state/state';

describe('delvisInnsendingSchema', () => {
  it('should validate a valid input', () => {
    const validInput = {
      inntekt: {
        endringBruttoloenn: 'Ja' as YesNo,
        beloep: 10000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 5000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: new Date('2022-12-31')
      }
    };

    const result = delvisInnsendingSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validInput);
  });

  it('should return an error if refusjonPrMnd is higher than inntekt.beloep', () => {
    const invalidInput = {
      inntekt: {
        endringBruttoloenn: 'Ja',
        beloep: 5000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 10000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: new Date('2022-12-31')
      }
    };

    const result = delvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Refusjon kan ikke være høyere enn brutto lønn.');
    expect(result.error.issues[0].path).toEqual(['refusjon', 'refusjonPrMnd']);
  });

  // Add more test cases as needed
});
