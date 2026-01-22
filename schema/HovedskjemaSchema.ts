import { z } from 'zod';
import { EndringAarsakSchema } from './EndringAarsakSchema';
import NaturalytelserSchema from './NaturalytelserSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';

export const HovedskjemaSchema = z
  .object({
    bekreft_opplysninger: z.boolean().refine((value) => value === true, {
      error: 'Du må bekrefte at opplysningene er riktige før du kan sende inn.'
    }),
    inntekt: z.optional(
      z.object({
        beloep: z
          .number({
            error: (issue) =>
              issue.input === undefined
                ? 'Vennligst fyll inn beløpet for inntekt.'
                : 'Vennligst angi bruttoinntekt på formatet 1234,50'
          })
          .min(0),
        endringAarsaker: z
          .union([z.array(EndringAarsakSchema), z.null('Vennligst angi årsak til endringen.')])
          .superRefine((val, ctx) => {
            if (JSON.stringify(val) === JSON.stringify([{}])) {
              ctx.issues.push({
                code: 'custom',
                message: 'Vennligst angi årsak til endringen.',
                path: ['0', 'aarsak'],
                fatal: true,
                input: ''
              });
              return z.NEVER;
            }
            const aarsaker = val?.map((v) => v.aarsak);
            const uniqueAarsaker = new Set(aarsaker);
            if (aarsaker && aarsaker.length > 0 && uniqueAarsaker.size !== aarsaker.length) {
              ctx.issues.push({
                code: 'custom',
                message: 'Det kan ikke være flere like begrunnelser.',
                path: ['root'],
                fatal: true,
                input: ''
              });
              return z.NEVER;
            }
            val?.forEach((v, index) => {
              if (v.aarsak === '' || v.aarsak === undefined) {
                ctx.issues.push({
                  code: 'custom',
                  message: 'Vennligst angi årsak til endringen.',
                  path: [index, 'aarsak'],
                  fatal: true,
                  input: ''
                });
              }
            });
          }),
        harBortfallAvNaturalytelser: z.boolean(),
        naturalytelser: z.array(NaturalytelserSchema).optional()
      })
    ),
    refusjon: z.object({
      beloepPerMaaned: z
        .number({ error: 'Vennligst angi hvor mye som refunderes per måned.' })
        .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
      isEditing: z.boolean()
    }),
    avsenderTlf: TelefonNummerSchema
  })
  .superRefine((val, ctx) => {
    if (
      val.inntekt?.beloep !== undefined &&
      val.refusjon?.beloepPerMaaned !== undefined &&
      val.inntekt?.beloep < val.refusjon?.beloepPerMaaned
    ) {
      ctx.issues.push({
        code: 'custom',
        message: 'Refusjonsbeløpet kan ikke være høyere enn inntekten.',
        path: ['refusjon', 'beloepPerMaaned'],
        fatal: true,
        input: val.refusjon?.beloepPerMaaned
      });
    }
  });
