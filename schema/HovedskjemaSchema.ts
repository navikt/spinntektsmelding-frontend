import { z } from 'zod';
import { EndringAarsakSchema } from './EndringAarsakSchema';
import NaturalytelserSchema from './NaturalytelserSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';

export const HovedskjemaSchema = z.object({
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
              error: 'Vennligst angi årsak til endringen.',
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
              error: 'Det kan ikke være flere like begrunnelser.',
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
                error: 'Vennligst angi årsak til endringen.',
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
  avsenderTlf: TelefonNummerSchema
});
