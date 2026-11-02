import { isValid } from 'date-fns';
import { z } from 'zod';
import { ApiEndringAarsakSchema } from '../schema/ApiEndringAarsakSchema';
import { KvitteringNavNoSchema } from '../schema/MottattKvitteringSchema';
import { LonnIArbeidsgiverperioden, Naturalytelse, Periode, YesNo } from '../state/state';
import { EndringAarsak } from '../validators/validerAapenInnsending';
import formatDate from './formatDate';
import formatTime from './formatTime';
import { lagRefusjonVisning } from './lagRefusjonVisning';
import parseIsoDate from './parseIsoDate';

type KvitteringNavNo = z.infer<typeof KvitteringNavNoSchema>;
type EndringAarsakVisning = z.infer<typeof ApiEndringAarsakSchema> | EndringAarsak;
type PeriodeInput = { fom?: string | Date; tom?: string | Date; id?: string };
export type NaturalytelseVisning = Omit<Naturalytelse, 'sluttdato'> & { sluttdato?: Date };
type FullLonnVisning = Omit<LonnIArbeidsgiverperioden, 'status' | 'begrunnelse'> & {
  status: YesNo;
  begrunnelse?: string;
};

interface KvitteringVisningInput {
  sykmeldingsperioder?: readonly PeriodeInput[];
  arbeidsgiverperioder?: readonly PeriodeInput[];
  inntektBeloep?: number;
  endringAarsaker?: readonly EndringAarsakVisning[] | null;
  bestemmendeFravaersdag?: string | Date;
  redusertLoennIAgp?: { beloep?: number | null; begrunnelse?: string } | null;
  naturalytelser?: readonly (Omit<Naturalytelse, 'sluttdato'> & { sluttdato?: string | Date })[] | null;
  refusjon: Parameters<typeof lagRefusjonVisning>[0];
  mottatt?: string | Date;
  sykmeldt?: KvitteringNavNo['sykmeldt'];
  avsender?: KvitteringNavNo['avsender'];
}

export interface KvitteringVisning {
  sykmeldingsperioder: Periode[] | undefined;
  arbeidsgiverperioder: Periode[] | undefined;
  inntekt: {
    beloep: number | undefined;
    endringAarsaker: readonly EndringAarsakVisning[];
  };
  bestemmendeFravaersdag: Date | undefined;
  naturalytelser: NaturalytelseVisning[];
  fullLonnIArbeidsgiverperioden: FullLonnVisning;
  refusjon: ReturnType<typeof lagRefusjonVisning>;
  mottatt: Date | undefined;
  innsendingTidspunkt: string;
  sykmeldt: KvitteringNavNo['sykmeldt'] | undefined;
  avsender: KvitteringNavNo['avsender'] | undefined;
}

function mapPerioder(perioder: readonly PeriodeInput[] | undefined): Periode[] | undefined {
  return perioder?.map((periode, index) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: periode.id ?? `periode-${index}`
  }));
}

export function lagKvitteringVisning(input: KvitteringVisningInput): KvitteringVisning {
  const mottatt = parseIsoDate(input.mottatt);
  const redusertLoenn = input.redusertLoennIAgp;

  return {
    sykmeldingsperioder: mapPerioder(input.sykmeldingsperioder),
    arbeidsgiverperioder: mapPerioder(input.arbeidsgiverperioder),
    inntekt: {
      beloep: input.inntektBeloep,
      endringAarsaker: input.endringAarsaker ?? []
    },
    bestemmendeFravaersdag: parseIsoDate(input.bestemmendeFravaersdag),
    naturalytelser: (input.naturalytelser ?? []).map((ytelse) => ({
      ...ytelse,
      sluttdato: parseIsoDate(ytelse.sluttdato)
    })),
    fullLonnIArbeidsgiverperioden: {
      status: redusertLoenn?.beloep === undefined || redusertLoenn.beloep === null ? 'Ja' : 'Nei',
      begrunnelse: redusertLoenn?.begrunnelse,
      utbetalt: redusertLoenn?.beloep
    },
    refusjon: lagRefusjonVisning(input.refusjon, input.bestemmendeFravaersdag),
    mottatt,
    innsendingTidspunkt: mottatt && isValid(mottatt) ? ` - ${formatDate(mottatt)} kl. ${formatTime(mottatt)}` : '',
    sykmeldt: input.sykmeldt,
    avsender: input.avsender
  };
}
