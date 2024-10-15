<<<<<<< HEAD
import { number, z } from 'zod';
=======
import { z } from 'zod';
>>>>>>> 43a7ae66 (Bruke SWR)

export const endepunktHentForespoerselSchema = z.object({
  navn: z.string(),
  telefonnummer: z.string().optional(),
  orgNavn: z.string(),
  innsenderNavn: z.string(),
  identitetsnummer: z.string(),
  orgnrUnderenhet: z.string(),
  fravaersperioder: z.array(
    z.object({
<<<<<<< HEAD
      fom: z.string().date(),
      tom: z.string().date()
=======
      fom: z.string(),
      tom: z.string()
>>>>>>> 43a7ae66 (Bruke SWR)
    })
  ),
  egenmeldingsperioder: z.array(
    z.object({
<<<<<<< HEAD
      fom: z.string().date(),
      tom: z.string().date()
=======
      fom: z.string(),
      tom: z.string()
>>>>>>> 43a7ae66 (Bruke SWR)
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
<<<<<<< HEAD
        beregningsmaaneder: z.array(z.string()),
        forrigeInntekt: z.object({ skjæringstidspunkt: z.string().date(), kilde: z.string(), beløp: z.number() })
=======
        forrigeInntekt: z.number().nullable()
>>>>>>> 43a7ae66 (Bruke SWR)
      })
    }),
    refusjon: z.object({
      paakrevd: z.boolean(),
      forslag: z.object({
<<<<<<< HEAD
        perioder: z.array(
          z.object({
            beloep: number(),
            fom: z.string().date()
          })
        ),
=======
        perioder: z.array(z.object({})),
>>>>>>> 43a7ae66 (Bruke SWR)
        opphoersdato: z.string().nullable()
      })
    })
  }),
<<<<<<< HEAD
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
=======
  erBesvart: z.boolean()
>>>>>>> 43a7ae66 (Bruke SWR)
});

export type ForespurtData = z.infer<typeof endepunktHentForespoerselSchema>;
