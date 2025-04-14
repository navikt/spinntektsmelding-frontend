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
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 1000,
        endringer: [],
        sluttdato: '2002-02-02'
      },
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    };

    expect(validerAapenInnsending(data).success).toBe(true);
  });

  it('should validate aapenInnsending, with endringAarsak set to NULL', () => {
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

        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 1000,
        endringer: [],
        sluttdato: '2002-02-02'
      },
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    };

    expect(validerAapenInnsending(data).success).toBe(true);
  });
});
