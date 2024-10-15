import { z } from 'zod';

export const endepunktHentForespoerselSchema = z.object({
  navn: z.string(),
  telefonnummer: z.string().optional(),
  orgNavn: z.string(),
  innsenderNavn: z.string(),
  identitetsnummer: z.string(),
  orgnrUnderenhet: z.string(),
  fravaersperioder: z.array(
    z.object({
      fom: z.string(),
      tom: z.string()
    })
  ),
  egenmeldingsperioder: z.array(
    z.object({
      fom: z.string(),
      tom: z.string()
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
        forrigeInntekt: z.number().nullable()
      })
    }),
    refusjon: z.object({
      paakrevd: z.boolean(),
      forslag: z.object({
        perioder: z.array(z.object({})),
        opphoersdato: z.string().nullable()
      })
    })
  }),
  erBesvart: z.boolean()
});

export type ForespurtData = z.infer<typeof endepunktHentForespoerselSchema>;
