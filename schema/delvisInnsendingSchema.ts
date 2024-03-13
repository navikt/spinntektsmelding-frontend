import { z } from 'zod';
import { EndringAarsakSchema, telefonNummerSchema } from '../validators/validerAapenInnsending';

const JaNeiSchema = z.enum(['Ja', 'Nei'], {
  errorMap: (issue, ctx) => ({ message: 'Vennligst angi om det har vært endringer.' })
});

const PositiveNumberSchema = z
  .string()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .refine((value) => value === null || !isNaN(Number(value)), {
    message: 'Ugyldig tallformat'
  })
  .transform((value) => (value === null ? null : Number(value)));

export default z
  .object({
    inntekt: z.object({
      endringBruttoloenn: JaNeiSchema,
      beloep: z.number().gte(0).optional(),
      endringAarsak: EndringAarsakSchema.optional()
    }),
    telefon: telefonNummerSchema,
    opplysningerBekreftet: z.boolean().refine((value) => value === true, {
      message: 'Vennligst bekreft at opplysningene er riktige og fullstendige.'
    }),
    refusjon: z
      .object({
        erDetEndringRefusjon: JaNeiSchema.optional(),
        kreverRefusjon: JaNeiSchema.optional(),
        harEndringer: JaNeiSchema.optional(),
        refusjonPrMnd: z.number().gte(0).optional(),
        refusjonEndringer: z
          .array(
            z.object({
              beloep: z.number().gte(0).optional(),
              dato: z.date().optional()
            })
          )
          .optional(),
        kravetOpphoerer: JaNeiSchema.optional(),
        refusjonOpphoerer: z.date().optional()
      })
      .superRefine((value, ctx) => {
        if (value.erDetEndringRefusjon !== 'Ja') {
          return true;
        }

        if (value.refusjonOpphoerer === undefined && value.kravetOpphoerer === 'Ja') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vennligst angi sluttdato for refusjonskravet.',
            path: ['refusjonOpphoerer']
          });
        }
      })
  })
  .superRefine((value, ctx) => {
    if ((value.inntekt.beloep ?? 0) < (value.refusjon.refusjonPrMnd ?? 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Refusjon kan ikke være høyere enn brutto lønn.',
        path: ['refusjon', 'refusjonPrMnd']
      });
    }
  });
