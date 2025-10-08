import z from 'zod';
import isMod11Number from '../utils/isMod11Number';
import { PersonnummerSchema } from './PersonnummerSchema';

const SkjemaInitieringSchema = z
  .object({
    organisasjonsnummer: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? 'Sjekk at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren.'
            : undefined
      })
      .transform((val) => val.replaceAll(/\s/g, ''))
      .pipe(
        z
          .string({
            error: (issue) => (issue.input === undefined ? 'Organisasjon er ikke valgt.' : undefined)
          })

          .refine((val) => isMod11Number(val), { error: 'Organisasjon er ikke valgt.' })
      ),
    navn: z.string().nullable().optional(),
    personnummer: PersonnummerSchema.optional(),
    // sykmeldingId: z.uuid('Du må velge en periode for behandlingsdager'),
    endreRefusjon: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.endreRefusjon === 'Ja') {
      ctx.issues.push({
        code: 'custom',
        error: 'Endring av refusjon for den ansatte må gjøres i den opprinnelige inntektsmeldingen.',
        path: ['endreRefusjon'],
        input: ''
      });
    }

    if (value.endreRefusjon === 'Nei') {
      ctx.issues.push({
        code: 'custom',
        error: 'Du kan ikke sende inn en inntektsmelding som forlengelse av en tidligere inntektsmelding.',
        path: ['endreRefusjon'],
        input: ''
      });
    }
  });

export default SkjemaInitieringSchema;
