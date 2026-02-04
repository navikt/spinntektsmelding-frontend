import { z } from 'zod';
import { EndringAarsakSchema } from './EndringAarsakSchema';
import NaturalytelserSchema from './NaturalytelserSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { BegrunnelseRedusertLoennIAgp } from './BegrunnelseRedusertLoennIAgpSchema';

const OpplysningstypeSchema = z.enum(['inntekt', 'refusjon', 'arbeidsgiverperiode']);

type HovedskjemaInput = {
  inntekt?: { beloep?: number };
  refusjon?: { beloepPerMaaned?: number; harEndringer?: 'Ja' | 'Nei'; endringer?: unknown[] };
  kreverRefusjon?: 'Ja' | 'Nei';
  fullLonn?: 'Ja' | 'Nei';
  agp?: { redusertLoennIAgp?: { beloep?: number | null; begrunnelse?: string } };
  opplysningstyper?: string[];
};

function validateRefusjonBeloep(val: HovedskjemaInput, ctx: z.RefinementCtx) {
  if (
    val.inntekt?.beloep !== undefined &&
    val.refusjon?.beloepPerMaaned !== undefined &&
    val.inntekt?.beloep < val.refusjon?.beloepPerMaaned
  ) {
    ctx.issues.push({
      code: 'custom',
      message: 'Refusjonsbeløpet kan ikke være høyere enn inntekten.',
      path: ['refusjon', 'beloepPerMaaned'],
      input: val.refusjon?.beloepPerMaaned
    });
  }
}

function validateRefusjonEndringer(val: HovedskjemaInput, ctx: z.RefinementCtx) {
  if (val.refusjon?.harEndringer === 'Ja' && (!val.refusjon.endringer || val.refusjon.endringer.length === 0)) {
    ctx.issues.push({
      code: 'custom',
      message: 'Vennligst legg til minst én endring.',
      path: ['refusjon', 'endringer'],
      input: val.refusjon?.endringer
    });
  }

  if (val.kreverRefusjon === 'Ja' && val.refusjon?.harEndringer !== 'Ja' && val.refusjon?.harEndringer !== 'Nei') {
    ctx.issues.push({
      code: 'custom',
      message: 'Vennligst angi om det er endringer i refusjonsbeløpet i perioden.',
      path: ['refusjon', 'harEndringer'],
      input: val.refusjon?.harEndringer
    });
  }
}

function validateKreverRefusjonOgFullLonn(val: HovedskjemaInput, ctx: z.RefinementCtx) {
  if (val.kreverRefusjon !== 'Ja' && val.kreverRefusjon !== 'Nei') {
    ctx.issues.push({
      code: 'custom',
      message: 'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden...',
      path: ['kreverRefusjon'],
      input: val.kreverRefusjon
    });
  }

  if (val.fullLonn !== 'Ja' && val.fullLonn !== 'Nei' && val.opplysningstyper?.includes('arbeidsgiverperiode')) {
    ctx.issues.push({
      code: 'custom',
      message: 'Velg om full lønn betales i arbeidsgiverperioden.',
      path: ['fullLonn'],
      input: val.fullLonn
    });
  }
}

function validateRedusertLoennIAgp(val: HovedskjemaInput, ctx: z.RefinementCtx) {
  if (val.fullLonn !== 'Nei') return;

  if (val.agp?.redusertLoennIAgp?.beloep === undefined || val.agp?.redusertLoennIAgp?.beloep === null) {
    console.log('[DEBUG] beloep is undefined/null, adding error');
    ctx.issues.push({
      code: 'custom',
      message: 'Beløp utbetalt i arbeidsgiverperioden må fylles ut.',
      path: ['agp', 'redusertLoennIAgp', 'beloep'],
      input: val.agp?.redusertLoennIAgp?.beloep
    });
  } else if ((val.inntekt?.beloep ?? 0) < val.agp.redusertLoennIAgp.beloep && (val.inntekt?.beloep ?? 0) !== 0) {
    ctx.issues.push({
      code: 'custom',
      message: 'Utbetalingen under arbeidsgiverperioden kan ikke være høyere enn beregnet månedslønn.',
      path: ['agp', 'redusertLoennIAgp', 'beloep'],
      input: val.agp?.redusertLoennIAgp?.beloep
    });
  }

  if (!val.agp?.redusertLoennIAgp?.begrunnelse) {
    console.log('[DEBUG] begrunnelse is falsy, adding error');
    ctx.issues.push({
      code: 'custom',
      message: 'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut',
      path: ['agp', 'redusertLoennIAgp', 'begrunnelse'],
      input: val.agp?.redusertLoennIAgp?.begrunnelse
    });
  }
}

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
      isEditing: z.boolean(),
      harEndringer: z.enum(['Ja', 'Nei']).or(z.undefined()),
      endringer: z
        .array(
          z.object({
            beloep: z.number({ error: 'Vennligst fyll inn beløpet for endret refusjon.' }).min(0),
            dato: z.date({ error: 'Vennligst fyll inn gyldig dato for endring av refusjon.' })
          })
        )
        .optional(),
      kravetOpphopieroerer: z.date().optional()
    }),
    kreverRefusjon: z
      .enum(['Ja', 'Nei'], {
        error: 'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden...'
      })
      .optional(),
    fullLonn: z.enum(['Ja', 'Nei'], { error: 'Velg om full lønn betales i arbeidsgiverperioden....' }).optional(),
    agp: z
      .object({
        // utbetalt: z.number({ error: 'Vennligst angi beløp utbetalt under arbeidsgiverperioden' }).min(0),
        // begrunnelse: z.string({ error: 'Vennligst velg begrunnelse' }),
        redusertLoennIAgp: z
          .nullable(
            z.object({
              beloep: z
                .number({
                  error: (issue) =>
                    issue.input === undefined ? 'Beløp utbetalt under arbeidsgiverperioden mangler.' : undefined
                })
                .min(0, 'Beløp utbetalt under arbeidsgiverperioden kan ikke være negativt.'),
              begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
                error: (issue) =>
                  issue.input === undefined
                    ? 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
                    : undefined
              })
            })
          )
          .or(z.undefined())
      })
      .or(z.object({}))
      .or(z.undefined()),
    avsenderTlf: TelefonNummerSchema,
    opplysningstyper: z.array(OpplysningstypeSchema).optional()
  })
  .superRefine((val, ctx) => {
    validateRefusjonBeloep(val, ctx);
    validateRefusjonEndringer(val, ctx);
    validateKreverRefusjonOgFullLonn(val, ctx);
    validateRedusertLoennIAgp(val, ctx);
  });
