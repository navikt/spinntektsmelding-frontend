import { z } from 'zod/v4';

import { ApiEndringAarsakSchema } from './ApiEndringAarsakSchema';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import { RefusjonEndringSchema } from './ApiRefusjonEndringSchema';
import { BegrunnelseRedusertLoennIAgp } from './BegrunnelseRedusertLoennIAgpSchema';
import { ApiNaturalytelserSchema } from './ApiNaturalytelserSchema';
import { isBefore } from 'date-fns';

function beregnTotaltAntallDager(fom: string, tom: string): number {
  const fomDate = new Date(fom);
  const tomDate = new Date(tom);
  return Math.ceil((tomDate.getTime() - fomDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 for å inkludere både start- og sluttdag
}

function langtGapIPerioder(perioder: Array<{ fom: string; tom: string }>): boolean {
  if (perioder.length < 2) return false;
  const sortedPerioder = [...perioder].sort((a, b) => new Date(a.fom).getTime() - new Date(b.fom).getTime());
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

function perioderErOver16dagerTotalt(perioder: Array<{ fom: string; tom: string }>): boolean {
  const totaltAntallDager = perioder.reduce((current: number, periode: { fom: string; tom: string }) => {
    return beregnTotaltAntallDager(periode.fom, periode.tom) + current;
  }, 0);

  if (totaltAntallDager > 16) {
    return true;
  }
  return false;
}

function perioderErUnder16dagerTotalt(perioder: Array<{ fom: string; tom: string }>): boolean {
  const totaltAntallDager = perioder.reduce((current: number, periode: { fom: string; tom: string }) => {
    return beregnTotaltAntallDager(periode.fom, periode.tom) + current;
  }, 0);

  if (totaltAntallDager < 16) {
    return true;
  }
  return false;
}

function perioderEr12Dager(perioder: Array<{ fom: string; tom: string }>): boolean {
  const totaltAntallDager = perioder.reduce((current: number, periode: { fom: string; tom: string }) => {
    return beregnTotaltAntallDager(periode.fom, periode.tom) + current;
  }, 0);

  if (totaltAntallDager === 12) {
    return true;
  }
  return false;
}

function perioderErSannsynligvisBehandlingsdager(perioder: Array<{ fom: string; tom: string }>): boolean {
  if (!perioderEr12Dager(perioder)) return false;
  const erEnkeltdager = perioder.every((periode) => {
    const totaltAntallDager = beregnTotaltAntallDager(periode.fom, periode.tom);
    return totaltAntallDager === 1;
  });

  return erEnkeltdager;
}

export const InnsendingSchema = z.object({
  agp: z
    .object({
      perioder: z.array(ApiPeriodeSchema).superRefine((val, ctx) => {
        if (langtGapIPerioder(val)) {
          ctx.issues.push({
            code: 'custom',
            error: 'Det kan ikke være opphold over 16 dager i arbeidsgiverperioden.',
            input: ''
          });
        }

        if (perioderHarOverlapp(val)) {
          ctx.issues.push({
            code: 'custom',
            error: 'Det kan ikke være overlappende perioder i arbeidsgiverperioden.',
            input: ''
          });
        }

        if (perioderErOver16dagerTotalt(val)) {
          ctx.issues.push({
            code: 'custom',
            error: 'Arbeidsgiverperioden kan ikke overstige 16 dager.',
            input: ''
          });
        }
      }),
      egenmeldinger: z.union([z.array(ApiPeriodeSchema), z.tuple([])]).superRefine((val, ctx) => {
        if (langtGapIPerioder(val)) {
          ctx.issues.push({
            code: 'custom',
            error: 'Det kan ikke være opphold over 16 dager mellom egenmeldingsperiodene.',
            input: ''
          });
        }

        if (perioderHarOverlapp(val)) {
          ctx.issues.push({
            code: 'custom',
            error: 'Det kan ikke være overlapp mellom egenmeldingsperiodene.',
            input: ''
          });
        }
      }),
      redusertLoennIAgp: z.nullable(
        z.object({
          beloep: z
            .number({
              error: (issue) =>
                issue.input === undefined ? 'Beløp utbetalt under arbeidsgiverperioden mangler.' : undefined
            })
            .min(0),
          begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
            error: (issue) =>
              issue.input === undefined
                ? 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
                : undefined
          })
        })
      )
    })
    .nullable()
    .superRefine((val, ctx) => {
      if (!val) {
        return;
      }

      if (
        perioderErUnder16dagerTotalt(val.perioder) &&
        val.redusertLoennIAgp?.beloep === undefined &&
        val.redusertLoennIAgp?.begrunnelse !== undefined
      ) {
        ctx.issues.push({
          code: 'custom',
          error: 'Angi beløp utbetalt arbeidsgiverperioden.',
          path: ['redusertLoennIAgp', 'beloep'],
          input: ''
        });
        return;
      }

      if (
        perioderErUnder16dagerTotalt(val.perioder) &&
        val.redusertLoennIAgp?.beloep !== undefined &&
        val.redusertLoennIAgp?.begrunnelse === undefined
      ) {
        ctx.issues.push({
          code: 'custom',
          error: 'Angi årsak til forkortet arbeidsgiverperiode.',
          path: ['redusertLoennIAgp', 'begrunnelse'],
          input: ''
        });
        return;
      }

      if (
        perioderErUnder16dagerTotalt(val.perioder) &&
        !val.redusertLoennIAgp &&
        !perioderErSannsynligvisBehandlingsdager(val.perioder)
      ) {
        ctx.issues.push({
          code: 'custom',
          error: 'Angi årsak til forkortet arbeidsgiverperiode.',
          path: ['redusertLoennIAgp', 'begrunnelse'],
          input: ''
        });

        ctx.issues.push({
          code: 'custom',
          error: 'Angi beløp utbetalt arbeidsgiverperioden.',
          path: ['redusertLoennIAgp', 'beloep'],
          input: ''
        });
        return;
      }

      if (
        val.redusertLoennIAgp &&
        perioderErUnder16dagerTotalt(val.perioder) &&
        !(val.redusertLoennIAgp?.beloep !== undefined && val.redusertLoennIAgp?.begrunnelse)
      ) {
        ctx.issues.push({
          code: 'custom',
          error: 'Angi en årsak og beløp for redusert lønn i arbeidsgiverperioden.',
          path: ['redusertLoennIAgp', 'beloep'],
          input: ''
        });
      }
    }),
  inntekt: z.nullable(
    z.object({
      beloep: z
        .number({
          error: (issue) => (issue.input === undefined ? 'Vennligst angi månedsinntekt' : undefined)
        })
        .min(0, 'Månedsinntekt må være større enn eller lik 0'),
      inntektsdato: z.string({
        error: (issue) => (issue.input === undefined ? 'Bestemmende fraværsdag mangler' : undefined)
      }),
      naturalytelser: ApiNaturalytelserSchema,
      endringAarsaker: z.array(ApiEndringAarsakSchema).nullable()
    })
  ),
  refusjon: z.nullable(
    z.object({
      beloepPerMaaned: z
        .number({ error: 'Vennligst angi hvor mye du refundere per måned' })
        .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
      endringer: z.array(RefusjonEndringSchema).nullable(),
      sluttdato: z.iso
        .date({
          error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn til dato' : 'Dette er ikke en gyldig dato')
        })
        .nullable()
    })
  )
});
// .superRefine((val, ctx) => {
//   if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
//     ctx.addIssue({
//       code: "custom",
//       error: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
//       path: ['refusjon', 'beloepPerMaaned']
//     });
//   }
// });

type TInnsendingSchema = z.infer<typeof InnsendingSchema>;

export function superRefineInnsending(val: TInnsendingSchema, ctx: z.RefinementCtx) {
  if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
    ctx.issues.push({
      code: 'custom',
      error: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
      path: ['refusjon', 'beloepPerMaaned'],
      input: ''
    });
  }

  if ((val.inntekt?.beloep ?? 0) < (val.agp?.redusertLoennIAgp?.beloep ?? 0)) {
    ctx.issues.push({
      code: 'custom',
      error: 'Inntekten kan ikke være lavere enn utbetalingen under arbeidsgiverperioden.',
      path: ['agp', 'redusertLoennIAgp', 'beloep'],
      input: ''
    });
  }

  if ((val.inntekt?.beloep ?? 0) >= 1000000) {
    ctx.issues.push({
      code: 'custom',
      error: 'Inntekten kan ikke være 1 million eller over.',
      path: ['inntekt', 'beloep'],
      input: ''
    });
  }

  if (val.refusjon) {
    const agpSluttdato = val.agp?.perioder?.[val.agp.perioder.length - 1]?.tom ?? undefined;
    val?.refusjon?.endringer?.forEach((endring, index) => {
      if (endring.beloep > (val.inntekt?.beloep ?? endring.beloep)) {
        ctx.issues.push({
          code: 'custom',
          error: 'Refusjon kan ikke være høyere enn inntekt.',
          path: ['refusjon', 'endringer', index, 'beloep'],
          input: ''
        });
      }

      if (isBefore(endring.startdato, agpSluttdato ?? '')) {
        ctx.issues.push({
          code: 'custom',
          error: 'Startdato for refusjonsendringer må være etter arbeidsgiverperioden.',
          path: ['refusjon', 'endringer', index, 'startdato'],
          input: ''
        });
      }

      if (isBefore(endring.startdato, val.inntekt?.inntektsdato ?? '')) {
        ctx.issues.push({
          code: 'custom',
          error: 'Startdato for refusjonsendringer må være etter dato for rapportert inntekt.',
          path: ['refusjon', 'endringer', index, 'startdato'],
          input: ''
        });
      }
    });
  }
}
