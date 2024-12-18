import { z } from 'zod';
import { TelefonNummerSchema } from './telefonNummerSchema';
import { SkjemavalideringEndringAarsakSchema } from './skjemavalideringEndringAarsakSchema';
import formatIsoDate from '../utils/formatIsoDate';

export default z
  .object({
    inntekt: z
      .object({
        endringBruttoloenn: z.enum(['Ja', 'Nei'], {
          errorMap: (_issue, _ctx) => ({ message: 'Vennligst angi om det har vært endringer i beregnet månedslønn.' })
        }),
        beloep: z.number().gte(0).optional(),
        endringAarsak: SkjemavalideringEndringAarsakSchema.optional()
      })
      .superRefine((value, ctx) => {
        if (value.endringBruttoloenn === 'Ja' && value.beloep === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vennligst angi månedsinntekt.',
            path: ['beloep']
          });
        }
      }),
    telefon: TelefonNummerSchema,
    opplysningerBekreftet: z.boolean().refine((value) => value === true, {
      message: 'Vennligst bekreft at opplysningene er riktige og fullstendige.'
    }),
    refusjon: z
      .object({
        erDetEndringRefusjon: z
          .enum(['Ja', 'Nei'], {
            errorMap: (_issue, _ctx) => ({ message: 'Vennligst angi om det har vært endringer i refusjonskravet.' })
          })
          .optional(),
        kreverRefusjon: z
          .enum(['Ja', 'Nei'], {
            errorMap: (_issue, _ctx) => ({
              message: 'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.'
            })
          })
          .optional(),
        harEndringer: z
          .enum(['Ja', 'Nei'], {
            errorMap: (_issue, _ctx) => ({ message: 'Vennligst angi om det er endringer i refusjonsbeløpet.' })
          })
          .optional(),
        refusjonPrMnd: z.number().gte(0).optional(),
        refusjonEndringer: z
          .array(
            z.object({
              beloep: z.number().gte(0).optional(),
              dato: z.date().optional()
            })
          )
          .optional(),
        kravetOpphoerer: z
          .enum(['Ja', 'Nei'], {
            errorMap: (_issue, _ctx) => ({ message: 'Vennligst angi om kravet opphører.' })
          })
          .optional(),
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
    if (typeof value.refusjon.refusjonPrMnd === 'undefined' && value.refusjon.kreverRefusjon === 'Ja') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Refusjonsbeløp mangler selv om det kreves refusjon.',
        path: ['refusjon', 'refusjonPrMnd']
      });
    }

    const refusjonInnsendingsdatoer = value.refusjon?.refusjonEndringer?.map((endring) => formatIsoDate(endring.dato));

    if (refusjonInnsendingsdatoer && new Set(refusjonInnsendingsdatoer).size !== refusjonInnsendingsdatoer.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Det er lagt inn flere refusjonsendringer på samme dato.',
        path: ['refusjon', 'harEndringer']
      });
    }

    if ((value.inntekt.beloep ?? 0) < (value.refusjon.refusjonPrMnd ?? 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Refusjon kan ikke være høyere enn brutto lønn.',
        path: ['refusjon', 'refusjonPrMnd']
      });
    }
  });
