import ValideringDelvisInnsendingSchema from '../../schema/ValideringDelvisInnsendingSchema';
import { YesNo } from '../../state/state';
import { describe, expect, it } from 'vitest';

describe.concurrent('ValideringDelvisInnsendingSchema', () => {
  it('should validate a valid input', () => {
    const validInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja' as YesNo,
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

    const result = ValideringDelvisInnsendingSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validInput);
  });

  it('should return an error if refusjonPrMnd is higher than inntekt.beloep', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
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

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Refusjon kan ikke være høyere enn brutto lønn.');
    expect(result.error.issues[0].path).toEqual(['refusjon', 'refusjonPrMnd']);
  });

  it('should return an error if ingenEndringBruttoloenn is Ja and inntekt.beloep is not set', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Nei',
        beloep: undefined,
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

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Vennligst angi månedsinntekt.');
    expect(result.error.issues[0].path).toEqual(['inntekt', 'beloep']);
  });

  it('should return an error if kreverRefusjon is not Ja or Nei', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'feil',
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

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.'
    );
    expect(result.error.issues[0].path).toEqual(['refusjon', 'kreverRefusjon']);
  });

  it('should return an error if kreverRefusjon is Ja and refusjonPrMnd is undefined', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: undefined,
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

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Refusjonsbeløp mangler selv om det kreves refusjon.');
    expect(result.error?.issues[0].path).toEqual(['refusjon', 'refusjonPrMnd']);
  });

  it('should return an error if kreverRefusjon is Ja and refusjonEndringer has entries with identical dates.', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 20000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          },
          {
            beloep: 2500,
            dato: new Date('2022-01-01')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: new Date('2022-12-31')
      }
    };

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Det kan ikke være flere endringer av refusjon samme dag.');
    expect(result.error?.issues[0].path).toEqual(['refusjon', 'harEndringer']);
  });

  it('should not return an error if kreverRefusjon is Ja and refusjonEndringer has entries without identical dates.', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 20000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          },
          {
            beloep: 2500,
            dato: new Date('2022-01-02')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: new Date('2022-12-31')
      }
    };

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(true);
  });

  it('should return an error if kreverRefusjon is Ja and refusjonOpphoerer is undefined', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 20000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          },
          {
            beloep: 2500,
            dato: new Date('2022-01-02')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: undefined
      }
    };

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Vennligst angi sluttdato for refusjonskravet.');
    expect(result.error?.issues[0].path).toEqual(['refusjon', 'refusjonOpphoerer']);
  });

  it('should not return an error if erDetEndringRefusjon is Nei and refusjonOpphoerer is undefined', () => {
    const invalidInput = {
      inntekt: {
        ingenEndringBruttoloenn: 'Ja',
        beloep: 50000,
        endringAarsak: { aarsak: 'Bonus' }
      },
      telefon: '+4712345678',
      opplysningerBekreftet: true,
      refusjon: {
        erDetEndringRefusjon: 'Nei',
        kreverRefusjon: 'Ja',
        harEndringer: 'Ja',
        refusjonPrMnd: 20000,
        refusjonEndringer: [
          {
            beloep: 2000,
            dato: new Date('2022-01-01')
          },
          {
            beloep: 2500,
            dato: new Date('2022-01-02')
          }
        ],
        kravetOpphoerer: 'Ja',
        refusjonOpphoerer: undefined
      }
    };

    const result = ValideringDelvisInnsendingSchema.safeParse(invalidInput);

    expect(result.success).toBe(true);
  });
  // Add more test cases as needed
});
