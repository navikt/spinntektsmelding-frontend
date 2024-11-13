import { z } from 'zod';
import { apiPeriodeSchema } from './apiPeriodeSchema';
import { PersonnummerSchema } from './personnummerSchema';
import { OrganisasjonsnummerSchema } from './organisasjonsnummerSchema';

export default z.object({
  kvitteringDokument: z
    .object({
      orgnrUnderenhet: OrganisasjonsnummerSchema,
      identitetsnummer: PersonnummerSchema,
      fulltNavn: z.string().min(1),
      telefonnummer: z.string().min(1),
      innsenderNavn: z.string().min(1),
      virksomhetNavn: z.string().min(1),
      egenmeldingsperioder: z.array(apiPeriodeSchema),
      arbeidsgiverperioder: z.array(apiPeriodeSchema),
      bestemmendeFraværsdag: z.string().min(1),
      fraværsperioder: z.array(apiPeriodeSchema),
      inntekt: z.object({
        bekreftet: z.boolean(),
        beregnetInntekt: z.number(),
        manueltKorrigert: z.boolean()
      }),
      fullLønnIArbeidsgiverPerioden: z.object({
        utbetalerFullLønn: z.boolean()
      }),
      refusjon: z.object({
        utbetalerHeleEllerDeler: z.boolean()
      }),
      årsakInnsending: z.enum(['NY', 'ENDRING']),
      bekreftOpplysninger: z.boolean(),
      tidspunkt: z.date(),
      forespurtData: z.array(z.string())
    })
    .nullable(),
  kvitteringEkstern: z
    .object({
      avsenderSystem: z.string(),
      referanse: z.string(),
      tidspunkt: z.date()
    })
    .nullable()
});
