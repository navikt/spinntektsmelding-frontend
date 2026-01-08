import { z } from 'zod';
import { Begrunnelse, Periode } from '../state/state';
import { PeriodeSchema } from '../schema/KonverterPeriodeSchema';
import { ApiNaturalytelserSchema } from '../schema/ApiNaturalytelserSchema';
import NaturalytelserSchema from '../schema/NaturalytelserSchema';
import { SelvbestemtKvittering } from '../schema/SelvbestemtKvitteringSchema';
import { RefusjonEndringSchema } from '../schema/RefusjonEndringSchema';
import { ApiEndringAarsakSchema } from '../schema/ApiEndringAarsakSchema';

export type ApiEndringAarsak = z.infer<typeof ApiEndringAarsakSchema>;

export type PersonData = {
  navn: string;
  identitetsnummer: string;
  orgnrUnderenhet: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
};

export interface SerializedPeriode {
  fom: string | null;
  tom: string | null;
  id: string;
}

export interface SerializedNaturalytelse {
  naturalytelse: string;
  sluttdato: string;
  verdiBeloep: number;
}

export interface SerializedEndringsBeloep {
  beloep?: number;
  dato?: string | null;
}

export interface MappedKvitteringAgiData {
  personData: PersonData;
  sykmeldingsperioder: SerializedPeriode[];
  egenmeldingsperioder: SerializedPeriode[];
  arbeidsgiverperioder: SerializedPeriode[];
  inntekt: {
    beregnetInntekt?: number;
  };
  fullLoennIArbeidsgiverPerioden: {
    status: 'Ja' | 'Nei';
    utbetalt?: number | null;
    begrunnelse?: Begrunnelse;
  };
  loenn: {
    status: 'Ja' | 'Nei';
    beloep?: number;
  };
  refusjonEndringer: SerializedEndringsBeloep[];
  naturalytelser: SerializedNaturalytelse[];
  endringAarsaker: ApiEndringAarsak[];
  bestemmendeFravaersdag: string | null;
  innsendingstidspunkt: string | null;
  vedtaksperiodeId?: string;
  selvbestemtType?: string;
  rawKvittering: any; // For clickEndre funksjonalitet
}

function mapPerioderTilSerializedFormat(perioder: z.infer<typeof PeriodeSchema>[] | undefined): SerializedPeriode[] {
  if (!perioder || perioder.length === 0) return [];

  return perioder.map((periode) => ({
    fom: periode.fom ?? null,
    tom: periode.tom ?? null,
    id: periode.fom + periode.tom
  }));
}

function mapNaturalytelserTilSerializedFormat(
  naturalytelser: z.infer<typeof ApiNaturalytelserSchema> | undefined
): SerializedNaturalytelse[] {
  if (!naturalytelser || naturalytelser.length === 0) return [];
  return naturalytelser.map((ytelse) => ({
    naturalytelse: ytelse.naturalytelse,
    sluttdato: ytelse.sluttdato,
    verdiBeloep: ytelse.verdiBeloep
  }));
}

// API-respons wrapper type - dette er hva som faktisk returneres fra serveren
// Responsen kan ha enten 'success' wrapper (legacy) eller direkte 'selvbestemtInntektsmelding'
export interface ApiKvitteringResponse {
  success?: SelvbestemtKvittering;
  selvbestemtInntektsmelding?: SelvbestemtKvittering['selvbestemtInntektsmelding'];
}

export function mapKvitteringAgiData(
  kvittering: ApiKvitteringResponse | SelvbestemtKvittering | null
): MappedKvitteringAgiData | null {
  // Håndter både legacy (med success wrapper) og nye formater
  const dok =
    (kvittering as ApiKvitteringResponse)?.success?.selvbestemtInntektsmelding ??
    (kvittering as SelvbestemtKvittering)?.selvbestemtInntektsmelding ??
    null;

  if (!dok) {
    return null;
  }

  const refusjonEndringer: SerializedEndringsBeloep[] =
    dok.refusjon?.endringer?.map((endring: z.infer<typeof RefusjonEndringSchema>) => ({
      dato: endring.startdato ?? null,
      beloep: endring.beloep
    })) ?? [];

  if (dok.refusjon?.sluttdato) {
    refusjonEndringer.push({
      beloep: 0,
      dato: dok.refusjon.sluttdato
    });
  }

  return {
    personData: {
      navn: dok.sykmeldt.navn,
      identitetsnummer: dok.sykmeldt.fnr,
      orgnrUnderenhet: dok.avsender.orgnr,
      virksomhetNavn: dok.avsender.orgNavn,
      innsenderNavn: dok.avsender.navn,
      innsenderTelefonNr: dok.avsender.tlf
    },
    sykmeldingsperioder: mapPerioderTilSerializedFormat(dok.sykmeldingsperioder),
    egenmeldingsperioder: mapPerioderTilSerializedFormat(dok.agp?.egenmeldinger),
    arbeidsgiverperioder: mapPerioderTilSerializedFormat(dok.agp?.perioder),
    inntekt: {
      beregnetInntekt: dok.inntekt.beloep
    },
    fullLoennIArbeidsgiverPerioden: {
      status: dok.agp?.redusertLoennIAgp ? 'Nei' : 'Ja',
      utbetalt: dok.agp?.redusertLoennIAgp?.beloep,
      begrunnelse: dok.agp?.redusertLoennIAgp?.begrunnelse as Begrunnelse | undefined
    },
    loenn: {
      status: dok.refusjon ? 'Ja' : 'Nei',
      beloep: dok.refusjon?.beloepPerMaaned
    },
    refusjonEndringer,
    naturalytelser: mapNaturalytelserTilSerializedFormat(dok.naturalytelser),
    endringAarsaker: dok.inntekt.endringAarsaker ?? [],
    bestemmendeFravaersdag: dok.inntekt.inntektsdato ?? null,
    innsendingstidspunkt: dok.mottatt ?? null,
    vedtaksperiodeId: (dok as any).vedtaksperiodeId,
    selvbestemtType: dok.type?.type,
    rawKvittering: dok
  };
}

// Hjelpefunksjoner for å konvertere tilbake til Periode[] på klienten
export function deserializePerioderTilInterntFormat(perioder: SerializedPeriode[]): Periode[] {
  return perioder.map((periode) => ({
    fom: periode.fom ? new Date(periode.fom) : undefined,
    tom: periode.tom ? new Date(periode.tom) : undefined,
    id: periode.id
  }));
}

export function deserializeNaturalytelser(
  naturalytelser: SerializedNaturalytelse[]
): z.infer<typeof NaturalytelserSchema>[] {
  return naturalytelser.map((ytelse) => ({
    naturalytelse: ytelse.naturalytelse as z.infer<typeof NaturalytelserSchema>['naturalytelse'],
    sluttdato: new Date(ytelse.sluttdato),
    verdiBeloep: ytelse.verdiBeloep
  }));
}

export function deserializeEndringsBeloep(endringer: SerializedEndringsBeloep[]): { beloep?: number; dato?: Date }[] {
  return endringer.map((endring) => ({
    beloep: endring.beloep,
    dato: endring.dato ? new Date(endring.dato) : undefined
  }));
}
