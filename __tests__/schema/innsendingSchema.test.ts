import { InnsendingSchema } from '../../schema/InnsendingSchema';

import { z } from 'zod/v4';

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
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'invalid_type',
              expected: 'array',
              message: 'Invalid input: expected array, received undefined',
              path: []
            }
          ],
          [
            {
              code: 'invalid_type',
              expected: 'tuple',
              message: 'Invalid input: expected tuple, received undefined',
              path: []
            }
          ]
        ],
        message: 'Invalid input',
        path: ['refusjon', 'endringer']
      },
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Vennligst fyll inn til dato',
        path: ['refusjon', 'sluttdato']
      }
    ]);
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
        error: 'Det kan ikke være opphold over 16 dager mellom egenmeldingsperiodene.',
        message: 'Invalid input',
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
        error: 'Det kan ikke være opphold over 16 dager i arbeidsgiverperioden.',
        message: 'Invalid input',
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
        error: 'Det kan ikke være overlapp mellom egenmeldingsperiodene.',
        message: 'Invalid input',
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
        error: 'Det kan ikke være overlappende perioder i arbeidsgiverperioden.',
        message: 'Invalid input',
        path: ['agp', 'perioder']
      },
      {
        code: 'custom',
        error: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        message: 'Invalid input',
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
        path: ['agp', 'perioder', 1, 'tom']
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
        path: ['agp', 'perioder', 1, 'fom']
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
        error: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        message: 'Invalid input',
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
        path: ['agp', 'redusertLoennIAgp', 'beloep']
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
        error: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
        message: 'Invalid input',
        path: ['agp', 'perioder']
      },
      {
        code: 'invalid_value',
        message: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.',
        path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
        values: [
          'ArbeidOpphoert',
          'BeskjedGittForSent',
          'BetvilerArbeidsufoerhet',
          'FerieEllerAvspasering',
          'FiskerMedHyre',
          'FravaerUtenGyldigGrunn',
          'IkkeFravaer',
          'IkkeFullStillingsandel',
          'IkkeLoenn',
          'LovligFravaer',
          'ManglerOpptjening',
          'Permittering',
          'Saerregler',
          'StreikEllerLockout',
          'TidligereVirksomhet'
        ]
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
});
