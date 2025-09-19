import { vendored } from 'next/dist/server/route-modules/pages/module.compiled';
import AapenInnsendingSchema from '../../schema/AapenInnsendingSchema';

import { z } from 'zod';

describe('AapenInnsendingSchema', () => {
  it('should validate AapenInnsendingSchema', () => {
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
      ],
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375' }
    };

    expect(AapenInnsendingSchema.safeParse(data).success).toBe(true);
  });

  it('should validate AapenInnsendingSchema with error on avsendertlf', () => {
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
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ],
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375' }
    };

    const result = AapenInnsendingSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Dette er ikke et telefonnummer',
        path: ['avsender', 'tlf']
      }
    ]);
  });

  it('should validate AapenInnsendingSchema with error on refusjon > inntekt', () => {
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
      refusjon: null,
      vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '911206722', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2023-02-20', tom: '2023-03-03' },
        { fom: '2023-03-05', tom: '2023-03-06' }
      ],
      arbeidsforholdType: { type: 'MedArbeidsforhold', vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375' }
    };
    const result = AapenInnsendingSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'custom',
        error: 'Inntekten kan ikke være lavere enn utbetalingen under arbeidsgiverperioden.',
        message: 'Invalid input',
        path: ['agp', 'redusertLoennIAgp', 'beloep']
      }
    ]);
  });
});
