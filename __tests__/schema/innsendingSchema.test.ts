import { InnsendingSchema, superRefineInnsending } from '../../schema/InnsendingSchema';

import { z } from 'zod';

describe('InnsendingSchema', () => {
  it('should validate InnsendingSchema', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(true);
  });

  it('should validate InnsendingSchema with error on refusjon > inntekt', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 50001, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 999999 },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const result = InnsendingSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toEqual(
      JSON.stringify(
        new z.ZodError([
          {
            code: 'invalid_union',
            unionErrors: [
              {
                issues: [
                  {
                    code: 'invalid_type',
                    expected: 'array',
                    received: 'undefined',
                    path: ['refusjon', 'endringer'],
                    message: 'Required'
                  }
                ],
                name: 'ZodError'
              },
              {
                issues: [
                  {
                    code: 'invalid_type',
                    expected: 'array',
                    received: 'undefined',
                    path: ['refusjon', 'endringer'],
                    message: 'Vennligst fyll inn dato og beløp for endringer'
                  }
                ],
                name: 'ZodError'
              }
            ],
            path: ['refusjon', 'endringer'],
            message: 'Invalid input'
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['refusjon', 'sluttdato'],
            message: 'Vennligst fyll inn til dato'
          }
        ])
      )
    );
  });

  it('should validate InnsendingSchema and fail with gap in perioder', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [
          { fom: '2023-02-17', tom: '2023-02-19' },
          { fom: '2023-01-10', tom: '2023-01-11' }
        ],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Det kan ikke være opphold over 16 dager mellom egenmeldingsperiodene.',
        path: ['agp', 'egenmeldinger']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail with gap in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-01-10', tom: '2023-01-11' },
          { fom: '2023-02-17', tom: '2023-03-02' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Det kan ikke være opphold over 16 dager i arbeidsgiverperioden.',
        path: ['agp', 'perioder']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail with overlapp in perioder', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [
          { fom: '2023-02-17', tom: '2023-02-19' },
          { fom: '2023-02-16', tom: '2023-02-18' }
        ],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Det kan ikke være overlapp mellom egenmeldingsperiodene.',
        path: ['agp', 'egenmeldinger']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail with overlapp in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-16', tom: '2023-02-19' },
          { fom: '2023-02-17', tom: '2023-03-03' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Det kan ikke være overlappende perioder i arbeidsgiverperioden.',
        path: ['agp', 'perioder']
      },
      {
        code: 'custom',
        message: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        path: ['agp', 'perioder']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when tom date is missing in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-16', tom: '2023-02-17' },
          { fom: '2023-02-18', tom: undefined }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Vennligst fyll inn til dato',
        path: ['agp', 'perioder', 1, 'tom'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when tom date is empty in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-16', tom: '2023-02-17' },
          { fom: '2023-02-18', tom: '' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Ugyldig dato',
        path: ['agp', 'perioder', 1, 'tom']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when fom date is missing in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-16', tom: '2023-02-17' },
          { fom: undefined, tom: '2023-02-19' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Vennligst fyll inn fra dato',
        path: ['agp', 'perioder', 1, 'fom'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when fom date is empty in agp', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-16', tom: '2023-02-17' },
          { fom: '', tom: '2023-02-19' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Ugyldig dato',
        path: ['agp', 'perioder', 1, 'fom']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when agp is longer than 16 days', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-17', tom: '2023-03-01' },
          { fom: '2023-03-06', tom: '2023-03-09' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        path: ['agp', 'perioder']
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when agp is shorter than 16 days and redusertLoennIAgp has missing beloep', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: undefined, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        message: 'Beløp utbetalt under arbeidsgiverperioden mangler.',
        path: ['agp', 'redusertLoennIAgp', 'beloep'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and fail when agp is shorter than 16 days and redusertLoennIAgp has missing begrunnelse', () => {
    const data = {
      agp: {
        perioder: [
          { fom: '2023-02-17', tom: '2023-03-01' },
          { fom: '2023-03-06', tom: '2023-03-09' }
        ],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 1234, begrunnelse: undefined }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        path: ['agp', 'perioder']
      },
      {
        code: 'invalid_type',
        expected:
          "'ArbeidOpphoert' | 'BeskjedGittForSent' | 'BetvilerArbeidsufoerhet' | 'FerieEllerAvspasering' | 'FiskerMedHyre' | 'FravaerUtenGyldigGrunn' | 'IkkeFravaer' | 'IkkeFullStillingsandel' | 'IkkeLoenn' | 'LovligFravaer' | 'ManglerOpptjening' | 'Permittering' | 'Saerregler' | 'StreikEllerLockout' | 'TidligereVirksomhet'",
        message: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and not fail when agp is shorter than 16 days and redusertLoennIAgp has beloep=0', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(true);
    expect(InnsendingSchema.safeParse(data).error).toBeUndefined();
  });

  it('should validate InnsendingSchema and refusjon endringer startdato is before inntektsdato', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          { startdato: '2023-02-01', beloep: 50000 },
          { startdato: '2023-02-15', beloep: 60000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Startdato for refusjonsendringer må være etter arbeidsgiverperioden.',
      path: ['refusjon', 'endringer', 1, 'startdato']
    });
  });

  it('should validate InnsendingSchema and fail if refusjon beloep < 0', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: -60000 } // Negative amount
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Refusjon må være større eller lik 0.',
      path: ['refusjon', 'endringer', 1, 'beloep']
    });
  });

  it('should validate InnsendingSchema and fail if refusjon beloep > inntekt', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 6000000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Refusjon kan ikke være høyere enn inntekt.',
      path: ['refusjon', 'endringer', 1, 'beloep']
    });
  });

  it('should validate InnsendingSchema and fail if inntekt > 1000000', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 1500000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Inntekten kan ikke være over 1 million.',
      path: ['inntekt', 'beloep']
    });
  });

  it('should validate InnsendingSchema and fail if inntekt < refusjon', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 0, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 750000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 850000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
      path: ['refusjon', 'beloepPerMaaned']
    });
  });

  it('should validate InnsendingSchema and fail if inntekt < utbetaling under fravær', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 800000, begrunnelse: 'StreikEllerLockout' }
      },
      inntekt: {
        beloep: 750000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 750000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    const mockAddIssue = vi.fn();
    const mockCtx = { addIssue: mockAddIssue };

    superRefineInnsending(data, mockCtx);

    expect(mockAddIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Inntekten kan ikke være lavere enn utbetalingen under arbeidsgiverperioden.',
      path: ['agp', 'redusertLoennIAgp', 'beloep']
    });
  });

  it('should validate InnsendingSchema and fail if redusertLoennIAgp beloep is set, but not begrunnelse', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-01' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: 750000, begrunnelse: undefined }
      },
      inntekt: {
        beloep: 750000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 750000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected:
          "'ArbeidOpphoert' | 'BeskjedGittForSent' | 'BetvilerArbeidsufoerhet' | 'FerieEllerAvspasering' | 'FiskerMedHyre' | 'FravaerUtenGyldigGrunn' | 'IkkeFravaer' | 'IkkeFullStillingsandel' | 'IkkeLoenn' | 'LovligFravaer' | 'ManglerOpptjening' | 'Permittering' | 'Saerregler' | 'StreikEllerLockout' | 'TidligereVirksomhet'",
        message: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and fail if redusertLoennIAgp is missing with short agp', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-02-27' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: undefined, begrunnelse: undefined }
      },
      inntekt: {
        beloep: 750000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 750000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        message: 'Beløp utbetalt under arbeidsgiverperioden mangler.',
        path: ['agp', 'redusertLoennIAgp', 'beloep'],
        received: 'undefined'
      },
      {
        code: 'invalid_type',
        expected:
          "'ArbeidOpphoert' | 'BeskjedGittForSent' | 'BetvilerArbeidsufoerhet' | 'FerieEllerAvspasering' | 'FiskerMedHyre' | 'FravaerUtenGyldigGrunn' | 'IkkeFravaer' | 'IkkeFullStillingsandel' | 'IkkeLoenn' | 'LovligFravaer' | 'ManglerOpptjening' | 'Permittering' | 'Saerregler' | 'StreikEllerLockout' | 'TidligereVirksomhet'",
        message: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
        received: 'undefined'
      }
    ]);
  });

  it('should validate InnsendingSchema and fail if redusertLoennIAgp begrunnelse is missing with short agp', () => {
    const data = {
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-02-27' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: { beloep: undefined, begrunnelse: undefined }
      },
      inntekt: {
        beloep: 750000,
        inntektsdato: '2023-02-14',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' },
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 750000,
        endringer: [
          { startdato: '2023-03-25', beloep: 50000 },
          { startdato: '2023-03-26', beloep: 600000 }
        ],
        sluttdato: null
      },
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ]
    };

    expect(InnsendingSchema.safeParse(data).success).toBe(false);
    expect(InnsendingSchema.safeParse(data).error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        message: 'Beløp utbetalt under arbeidsgiverperioden mangler.',
        path: ['agp', 'redusertLoennIAgp', 'beloep'],
        received: 'undefined'
      },
      {
        code: 'invalid_type',
        expected:
          "'ArbeidOpphoert' | 'BeskjedGittForSent' | 'BetvilerArbeidsufoerhet' | 'FerieEllerAvspasering' | 'FiskerMedHyre' | 'FravaerUtenGyldigGrunn' | 'IkkeFravaer' | 'IkkeFullStillingsandel' | 'IkkeLoenn' | 'LovligFravaer' | 'ManglerOpptjening' | 'Permittering' | 'Saerregler' | 'StreikEllerLockout' | 'TidligereVirksomhet'",
        message: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
        received: 'undefined'
      }
    ]);
  });
});
