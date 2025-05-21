import { z } from 'zod';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { EndringAarsakSchema } from './EndringAarsakSchema';
import { isEqual } from 'date-fns/isEqual';

export default z
  .object({
    inntekt: z
      .object({
        ingenEndringBruttoloenn: z.enum(['Ja', 'Nei'], {
          errorMap: (_issue, _ctx) => ({ message: 'Vennligst angi om det har vært endringer i beregnet månedslønn.' })
        }),
        beloep: z.number().gte(0).optional(),
        endringAarsak: EndringAarsakSchema.optional()
      })
      .superRefine((value, ctx) => {
        if (value.ingenEndringBruttoloenn === 'Nei' && value.beloep === undefined) {
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

    if ((value.inntekt.beloep ?? 0) < (value.refusjon.refusjonPrMnd ?? 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Refusjon kan ikke være høyere enn brutto lønn.',
        path: ['refusjon', 'refusjonPrMnd']
      });
    }

    if (value.refusjon.harEndringer === 'Ja') {
      const sorterteEndringer = value.refusjon.refusjonEndringer
        ? value.refusjon.refusjonEndringer.toSorted((a, b) => {
            if (a.dato && b.dato) {
              return a.dato > b.dato ? 1 : -1;
            }
            return -1;
          })
        : [];
      const unikeEndringer = sorterteEndringer.reduce(
        (acc: Array<{ beloep?: number; dato?: Date }>, endring, index) => {
          if (index === 0) {
            acc.push(endring);
            return acc;
          }
          if (!isEqual(endring.dato as Date, acc[acc.length - 1].dato as Date)) {
            acc.push(endring);
          }
          return acc;
        },
        []
      );

      if (unikeEndringer.length !== value.refusjon.refusjonEndringer?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Det kan ikke være flere endringer av refusjon samme dag.',
          path: ['refusjon', 'harEndringer']
        });
      }

      value.refusjon.refusjonEndringer?.map((endring, index) => {
        if ((endring.beloep ?? 0) > (value.inntekt?.beloep ?? 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Refusjon kan ikke være høyere enn brutto lønn.',
            path: ['refusjon', 'refusjonEndringer', index, 'beloep']
          });
        }
      });
    }
  });
