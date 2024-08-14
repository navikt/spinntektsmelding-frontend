import validerAapenInnsending, { AapenInnsending } from '../../validators/validerAapenInnsending';

describe('validerAapenInnsending', () => {
  it('should validate aapenInnsending', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: {
        orgnr: '810007842',
        tlf: '12345678'
      },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: {
        perioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
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
        sluttdato: '2002-02-02'
      },
      aarsakInnsending: 'Endring'
    };

    expect(validerAapenInnsending(data).success).toBe(true);
  });
});
