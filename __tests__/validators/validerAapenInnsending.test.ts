import validerAapenInnsending, { PersonnummerSchema } from '../../validators/validerAapenInnsending';

describe('validerAapenInnsending', () => {
  it('should validate PersonnummerSchema', () => {
    const data = '10107400090';

    expect(PersonnummerSchema.safeParse(data).success).toBe(true);
  });

  it('should invalidate PersonnummerSchema', () => {
    const data = '12345678';

    expect(PersonnummerSchema.safeParse(data).success).toBe(false);
  });

  it('should validate aapenInnsending', () => {
    const data = {
      sykmeldtFnr: '10107400090',
      avsender: {
        orgnr: '810007842',
        tlf: '12345678'
      },
      sykmeldingsperioder: [{ fom: new Date(), tom: new Date() }],
      agp: {
        perioder: [{ fom: new Date(), tom: new Date() }],
        egenmeldinger: [],
        redusertLoennIAgp: {
          beloep: 1000,
          begrunnelse: 'IkkeFravaer'
        }
      },
      inntekt: {
        beloep: 1000,
        inntektsdato: '2002-02-02',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' }
      },
      refusjon: {
        beloepPerMaaned: 1000,
        endringer: [],
        sluttdato: new Date()
      },
      aarsakInnsending: 'Endring'
    };

    expect(validerAapenInnsending(data).success).toBe(true);
  });
});
