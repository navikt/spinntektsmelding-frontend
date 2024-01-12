import { z } from 'zod';
import isFnrNumber from '../utils/isFnrNumber';
import isMod11Number from '../utils/isMod10Number';
import { isTlfNumber } from '../utils/isTlfNumber';

const NaturalytelseEnum = z.enum([
  'AKSJERGRUNNFONDSBEVISTILUNDERKURS',
  'ANNET',
  'BEDRIFTSBARNEHAGEPLASS',
  'BESOEKSREISERHJEMMETANNET',
  'BIL',
  'BOLIG',
  'ELEKTRONISKKOMMUNIKASJON',
  'FRITRANSPORT',
  'INNBETALINGTILUTENLANDSKPENSJONSORDNING',
  'KOSTBESPARELSEIHJEMMET',
  'KOSTDAGER',
  'KOSTDOEGN',
  'LOSJI',
  'OPSJONER',
  'RENTEFORDELLAAN',
  'SKATTEPLIKTIGDELFORSIKRINGER',
  'TILSKUDDBARNEHAGEPLASS',
  'YRKEBILTJENESTLIGBEHOVKILOMETER',
  'YRKEBILTJENESTLIGBEHOVLISTEPRIS'
]);

const BegrunnelseRedusertLoennIAgpEnum = z.enum([
  'ArbeidOpphoert',
  'BeskjedGittForSent',
  'BetvilerArbeidsufoerhet',
  'FerieEllerAvspasering',
  'FiskerMedHyre',
  'FravaerUtenGyldigGrunn',
  'IkkeFravaer',
  'IkkeFullStillingsandel',
  'IkkeLoenn',
  'LovligFravaer',
  'ManglerOpptjening',
  'Permittering',
  'Saerregler',
  'StreikEllerLockout',
  'TidligereVirksomhet'
]);

const InntektEndringAarsakEnum = z.enum([
  'Bonus',
  'Feilregistrert',
  'Ferie',
  'Ferietrekk',
  'Nyansatt',
  'NyStilling',
  'NyStillingsprosent',
  'Permisjon',
  'Permittering',
  'Sykefravaer',
  'Tariffendring',
  'VarigLoennsendring'
]);

const schema = z.object({
  sykmeldtFnr: z
    .string()
    .transform((val) => val.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
        .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
    )
    .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer', path: ['identitetsnummer'] }),
  avsender: z.object({
    orgnr: z
      .string()
      .transform((val) => val.replace(/\s/g, ''))
      .pipe(
        z
          .string()
          .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
          .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      )
      .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver', path: ['organisasjonsnummer'] }),
    tlf: z
      .string()
      .min(8)
      .refine((val) => isTlfNumber(val), { message: 'Telefon nummeret er ikke gyldig', path: ['telefon'] })
  }),
  sykmeldingsperioder: z.array(
    z.object({
      fom: z.date(),
      tom: z.date()
    })
  ),
  agp: z.object({
    perioder: z.array(
      z.object({
        fom: z.date(),
        tom: z.date()
      })
    ),
    egenmeldinger: z.array(
      z.object({
        fom: z.date(),
        tom: z.date()
      })
    ),
    redusertLoennIAgp: z.optional(
      z.object({
        beloep: z.number().min(0),
        begrunnelse: BegrunnelseRedusertLoennIAgpEnum
      })
    )
  }),
  inntekt: z.optional(
    z.object({
      beloep: z.number().min(0),
      inntektsdato: z.date(),
      naturalytelser: z.array(
        z.object({
          naturalytelse: NaturalytelseEnum,
          verdiBeloep: z.number().min(0),
          sluttdato: z.date()
        })
      ),
      endringAarsak: z.optional(InntektEndringAarsakEnum)
    })
  )
});

export default function validerAapenInnsending(data: any) {
  return schema.safeParse(data);
}
