import { z } from 'zod';
import { OrganisasjonsnummerSchema, PersonnummerSchema } from '../validators/validerAapenInnsending';

export default z.object({
  kvitteringDokument: z.object({
    organisasjonsnummer: OrganisasjonsnummerSchema,
    identitetsnummer: PersonnummerSchema,
    fulltNavn: z.string().min(1),
    telefonnummer: z.string().min(1),
    innsenderNavn: z.string().min(1),
    virksomhetNavn: z.string().min(1),
    behandlingsdager: z.array(PeriodeSchema),
    egenmeldingsperioder: z.array(PeriodeSchema),
    arbeidsgiverperioder: z.array(PeriodeSchema),
    bestemmendeFraværsdag: z.string().min(1),
    fraværsperioder: z.array(PeriodeSchema),
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
});
