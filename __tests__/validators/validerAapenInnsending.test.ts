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
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 1000,
        endringer: [],
        sluttdato: '2002-02-02'
      },
      arbeidsforholdType: {
        type: 'MedArbeidsforhold',
        vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
      },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: null
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
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 1000,
        endringer: [],
        sluttdato: '2002-02-02'
      },
      arbeidsforholdType: {
        type: 'MedArbeidsforhold',
        vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
      },
      naturalytelser: [],
      flereArbeidsforhold: null,
      aarsakInnsending: 'Ny'
    };

    expect(validerAapenInnsending(data).error).toBeUndefined();
    expect(validerAapenInnsending(data).success).toBe(true);
  });

  it('should validate aapenInnsending with valid flereArbeidsforhold', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: null,
      inntekt: { beloep: 1000, inntektsdato: '2002-02-02', endringAarsaker: [{ aarsak: 'Bonus' }] },
      refusjon: null,
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584' },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: true,
        arbeidsforholdPerSykmeldingStartdato: {
          '01-02-2024': [
            { inntekt: 50000, stillingsprosent: 100, yrkesbeskrivelse: 'Sykepleier', inkludertISykefravaer: true }
          ]
        }
      }
    };

    expect(validerAapenInnsending(data).success).toBe(true);
    expect(validerAapenInnsending(data).error).toBeUndefined();
  });

  it('should fail validation when flereArbeidsforhold arbeidsforhold inntekt is negative', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: null,
      inntekt: { beloep: 1000, inntektsdato: '2002-02-02', endringAarsaker: [{ aarsak: 'Bonus' }] },
      refusjon: null,
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584' },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: true,
        arbeidsforholdPerSykmeldingStartdato: {
          '01-02-2024': [{ inntekt: -500, stillingsprosent: 100, yrkesbeskrivelse: 'Sykepleier' }]
        }
      }
    };

    const result = validerAapenInnsending(data);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (i) => i.path.includes('inntekt') && i.path.includes('arbeidsforholdPerSykmeldingStartdato')
      )
    ).toBe(true);
  });

  it('should fail validation when flereArbeidsforhold arbeidsforhold stillingsprosent is negative', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: null,
      inntekt: { beloep: 1000, inntektsdato: '2002-02-02', endringAarsaker: [{ aarsak: 'Bonus' }] },
      refusjon: null,
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584' },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: true,
        arbeidsforholdPerSykmeldingStartdato: {
          '01-02-2024': [{ inntekt: 50000, stillingsprosent: -10, yrkesbeskrivelse: 'Sykepleier' }]
        }
      }
    };

    const result = validerAapenInnsending(data);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (i) => i.path.includes('stillingsprosent') && i.path.includes('arbeidsforholdPerSykmeldingStartdato')
      )
    ).toBe(true);
  });

  it('should validate aapenInnsending with flereArbeidsforhold when optional fields are undefined', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: null,
      inntekt: { beloep: 1000, inntektsdato: '2002-02-02', endringAarsaker: [{ aarsak: 'Bonus' }] },
      refusjon: null,
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584' },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: {
        harLikLoenn: true,
        erSykmeldtFraAlle: false,
        arbeidsforholdPerSykmeldingStartdato: {
          '01-02-2024': [{ inntekt: undefined, stillingsprosent: undefined, yrkesbeskrivelse: undefined }]
        }
      }
    };

    expect(validerAapenInnsending(data).success).toBe(true);
    expect(validerAapenInnsending(data).error).toBeUndefined();
  });

  it('should validate aapenInnsending with multiple arbeidsforhold including zero values', () => {
    const data: AapenInnsending = {
      sykmeldtFnr: '10107400090',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2002-02-02', tom: '2002-02-02' }],
      agp: null,
      inntekt: { beloep: 1000, inntektsdato: '2002-02-02', endringAarsaker: [{ aarsak: 'Bonus' }] },
      refusjon: null,
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584' },
      naturalytelser: [],
      aarsakInnsending: 'Ny',
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: false,
        arbeidsforholdPerSykmeldingStartdato: {
          '01-02-2024': [
            { inntekt: 0, stillingsprosent: 0, yrkesbeskrivelse: 'Lege', inkludertISykefravaer: false },
            { inntekt: 50000, stillingsprosent: 50, yrkesbeskrivelse: 'Konsulent', inkludertISykefravaer: true }
          ]
        }
      }
    };

    expect(validerAapenInnsending(data).success).toBe(true);
    expect(validerAapenInnsending(data).error).toBeUndefined();
  });
});
