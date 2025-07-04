import { z } from 'zod';

import { ApiEndringAarsakSchema } from './ApiEndringAarsakSchema';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import { RefusjonEndringSchema } from './ApiRefusjonEndringSchema';
import { BegrunnelseRedusertLoennIAgp } from './BegrunnelseRedusertLoennIAgpSchema';
import { ApiNaturalytelserSchema } from './ApiNaturalytelserSchema';
import { isBefore } from 'date-fns';

function langtGapIPerioder(perioder: Array<{ fom: string; tom: string }>): boolean {
  if (perioder.length < 2) return false;
  const sortedPerioder = perioder.sort((a, b) => new Date(a.fom).getTime() - new Date(b.fom).getTime());
  for (let i = 1; i < sortedPerioder.length; i++) {
    const gap = new Date(sortedPerioder[i].fom).getTime() - new Date(sortedPerioder[i - 1].tom).getTime();
    if (gap > 16 * 24 * 60 * 60 * 1000) {
      // mer enn 16 dager
      return true;
    }
  }
  return false;
}

function perioderHarOverlapp(perioder: Array<{ fom: string; tom: string }>): boolean {
  for (let i = 0; i < perioder.length; i++) {
    for (let j = i + 1; j < perioder.length; j++) {
      if (
        new Date(perioder[i].fom) <= new Date(perioder[j].tom) &&
        new Date(perioder[i].tom) >= new Date(perioder[j].fom)
      ) {
        return true;
      }
    }
  }
  return false;
}

export const InnsendingSchema = z.object({
  agp: z
    .object({
      perioder: z.array(ApiPeriodeSchema).superRefine((val, ctx) => {
        if (langtGapIPerioder(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Det kan ikke være opphold over 16 dager i arbeidsgiverperioden.'
          });
        }

        if (perioderHarOverlapp(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Det kan ikke være overlappende perioder i arbeidsgiverperioden.'
          });
        }
      }),
      egenmeldinger: z.union([z.array(ApiPeriodeSchema), z.tuple([])]).superRefine((val, ctx) => {
        if (langtGapIPerioder(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Det kan ikke være opphold over 16 dager mellom egenmeldingsperiodene.'
          });
        }

        if (perioderHarOverlapp(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Det kan ikke være overlapp mellom egenmeldingsperiodene.'
          });
        }
      }),
      redusertLoennIAgp: z.nullable(
        z.object({
          beloep: z.number().min(0),
          begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
            required_error: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
          })
        })
      )
    })
    .nullable(),
  inntekt: z.nullable(
    z.object({
      beloep: z
        .number({ required_error: 'Vennligst angi månedsinntekt' })
        .min(0, 'Månedsinntekt må være større enn eller lik 0'),
      inntektsdato: z.string({ required_error: 'Bestemmende fraværsdag mangler' }),
      naturalytelser: ApiNaturalytelserSchema,
      endringAarsaker: z.nullable(z.array(ApiEndringAarsakSchema))
    })
  ),
  refusjon: z.nullable(
    z.object({
      beloepPerMaaned: z
        .number({ required_error: 'Vennligst angi hvor mye du refundere per måned' })
        .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
      endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])]),
      sluttdato: z
        .string({
          required_error: 'Vennligst fyll inn til dato',
          invalid_type_error: 'Dette er ikke en gyldig dato'
        })
        .date()
        .nullable()
    })
  )
});
// .superRefine((val, ctx) => {
//   if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
//       path: ['refusjon', 'beloepPerMaaned']
//     });
//   }
// });

type TInnsendingSchema = z.infer<typeof InnsendingSchema>;

export function superRefineInnsending(val: TInnsendingSchema, ctx: z.RefinementCtx) {
  if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
      path: ['refusjon', 'beloepPerMaaned']
    });
  }

  if ((val.inntekt?.beloep ?? 0) < (val.agp?.redusertLoennIAgp?.beloep ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Inntekten kan ikke være lavere enn utbetalingen under arbeidsgiverperioden.',
      path: ['agp', 'redusertLoennIAgp', 'beloep']
    });
  }

  if ((val.inntekt?.beloep ?? 0) > 1000000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Inntekten kan ikke være over 1 million.',
      path: ['inntekt', 'beloep']
    });
  }

  if (val.refusjon) {
    const agpSluttdato = val.agp?.perioder?.[val.agp.perioder.length - 1]?.tom ?? undefined;
    val.refusjon?.endringer.forEach((endring, index) => {
      if (endring.beloep > (val.inntekt?.beloep ?? endring.beloep)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Refusjon kan ikke være høyere enn inntekt.',
          path: ['refusjon', 'endringer', index, 'beloep']
        });
      }
      if (endring.beloep < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Refusjon må være større eller lik 0.',
          path: ['refusjon', 'endringer', index, 'beloep']
        });
      }

      if (isBefore(endring.startdato, agpSluttdato ?? '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Startdato for refusjonsendringer må være etter arbeidsgiverperioden.',
          path: ['refusjon', 'endringer', index, 'startdato']
        });
      }

      if (isBefore(endring.startdato, val.inntekt?.inntektsdato ?? '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Startdato for refusjonsendringer må være etter dato for rapportert inntekt.',
          path: ['refusjon', 'endringer', index, 'startdato']
        });
      }
    });
  }
}
