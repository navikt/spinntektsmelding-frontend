import { number, z } from 'zod';

export const endepunktHentForespoerselSchema = z.object({
  navn: z.string(),
  telefonnummer: z.string().optional(),
  orgNavn: z.string(),
  innsenderNavn: z.string(),
  identitetsnummer: z.string(),
  orgnrUnderenhet: z.string(),
  fravaersperioder: z.array(
    z.object({
      fom: z.string().date(),
      tom: z.string().date()
    })
  ),
  egenmeldingsperioder: z.array(
    z.object({
      fom: z.string().date(),
      tom: z.string().date()
    })
  ),
  bestemmendeFravaersdag: z.string().date(),
  eksternBestemmendeFravaersdag: z.string().date().nullable(),
  bruttoinntekt: z.number(),
  tidligereinntekter: z.array(
    z.object({
      maaned: z.string(),
      inntekt: z.number()
    })
  ),
  forespurtData: z.object({
    arbeidsgiverperiode: z.object({
      paakrevd: z.boolean()
    }),
    inntekt: z.object({
      paakrevd: z.boolean(),
      forslag: z.object({
        type: z.enum(['ForslagInntektGrunnlag']),
        beregningsmaaneder: z.array(z.string()),
        forrigeInntekt: z.object({ skjæringstidspunkt: z.string().date(), kilde: z.string(), beløp: z.number() })
      })
    }),
    refusjon: z.object({
      paakrevd: z.boolean(),
      forslag: z.object({
        perioder: z.array(
          z.object({
            beloep: number(),
            fom: z.string().date()
          })
        ),
        opphoersdato: z.string().nullable()
      })
    })
  }),
  erBesvart: z.boolean(),
  feilReport: z
    .object({
      feil: z.array(
        z.object({
          datafelt: z.string(),
          melding: z.string()
        })
      )
    })
    .optional()
});

export type ForespurtData = z.infer<typeof endepunktHentForespoerselSchema>;
