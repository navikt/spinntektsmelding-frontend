import { isValid } from 'date-fns';
import { useMemo } from 'react';
import { Periode } from '../state/state';
import parseIsoDate from './parseIsoDate';
import formatDate from './formatDate';
import formatTime from './formatTime';
import { ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';
import z from 'zod';
import { MottattKvittering } from '../state/useKvitteringInit';

type ApiPeriode = z.infer<typeof ApiPeriodeSchema>;

interface StoreData {
  bruttoinntekt: any;
  lonnISykefravaeret: any;
  sykmeldingsperioder: Periode[] | undefined;
  naturalytelser: any;
  arbeidsgiverperioder: Periode[] | undefined;
  kvitteringInnsendt: Date | undefined;
  kvitteringEksterntSystem: any;
  gammeltSkjaeringstidspunkt: Date | undefined;
  kvitteringData: any;
}

interface UseKvitteringDataParams {
  kvittering: MottattKvittering | null;
  dataFraBackend: boolean;
  storeData: StoreData;
}

function getStoreInnsendingTidspunkt(kvitteringEksterntSystem: any, kvitteringInnsendt: Date | undefined): string {
  if (kvitteringEksterntSystem?.tidspunkt) {
    const tidspunkt = new Date(kvitteringEksterntSystem.tidspunkt);
    return tidspunkt && isValid(tidspunkt) ? ` - ${formatDate(tidspunkt)} kl. ${formatTime(tidspunkt)}` : '';
  }
  return kvitteringInnsendt && isValid(kvitteringInnsendt)
    ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
    : '';
}

export function useKvitteringData({ kvittering, dataFraBackend, storeData }: UseKvitteringDataParams) {
  const ssrData = kvittering?.kvitteringNavNo;

  const {
    bruttoinntekt,
    sykmeldingsperioder,
    naturalytelser,
    arbeidsgiverperioder,
    kvitteringInnsendt,
    kvitteringEksterntSystem,
    gammeltSkjaeringstidspunkt,
    kvitteringData
  } = storeData;

  const storeInnsendingTidspunkt = getStoreInnsendingTidspunkt(kvitteringEksterntSystem, kvitteringInnsendt);

  const bestemmendeFravaersdag = kvitteringData
    ? parseIsoDate(kvitteringData?.inntekt?.inntektsdato)
    : gammeltSkjaeringstidspunkt;

  return useMemo(() => {
    if (!dataFraBackend) {
      return {
        aktiveSykmeldingsperioder: sykmeldingsperioder,
        aktiveArbeidsgiverperioder: arbeidsgiverperioder,
        aktivBruttoinntekt: bruttoinntekt,
        aktivBestemmendeFravaersdag: bestemmendeFravaersdag,
        aktiveNaturalytelser: naturalytelser,
        aktivFullLonnIArbeidsgiverPerioden: kvitteringData?.agp?.redusertLoennIAgp
          ? {
              status:
                kvitteringData?.agp?.redusertLoennIAgp?.beloep === undefined ||
                kvitteringData?.agp?.redusertLoennIAgp?.beloep === null
                  ? 'Ja'
                  : 'Nei',
              begrunnelse: kvitteringData?.agp?.redusertLoennIAgp?.begrunnelse,
              utbetalt: kvitteringData?.agp?.redusertLoennIAgp?.beloep
            }
          : { status: 'Ja', begrunnelse: undefined, utbetalt: undefined },
        aktivLonnISykefravaeret: {
          status:
            kvitteringData?.refusjon?.beloepPerMaaned !== undefined &&
            kvitteringData?.refusjon?.beloepPerMaaned !== null
              ? 'Ja'
              : 'Nei',
          beloep: kvitteringData?.refusjon?.beloepPerMaaned
        },
        aktivInnsendingTidspunkt: storeInnsendingTidspunkt,
        aktivAvsender: undefined,
        aktivSykmeldt: undefined,
        aktivRefusjonEndringer:
          kvitteringData?.refusjon?.endringer?.map((endring: any) => ({
            beloep: endring.beloep,
            dato: parseIsoDate(endring.dato) ?? parseIsoDate(endring.startdato)
          })) || []
      };
    }

    const aktiveSykmeldingsperioder = ssrData?.sykmeldingsperioder.map((periode: ApiPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom)
    })) as Periode[];

    const aktiveArbeidsgiverperioder = ssrData?.skjema?.agp?.perioder?.map((p: any, i: number) => ({
      fom: parseIsoDate(p.fom),
      tom: parseIsoDate(p.tom),
      id: `agp-${i}`
    }));

    const aktivBruttoinntekt = {
      bruttoInntekt: ssrData?.skjema?.inntekt?.beloep,
      endringAarsaker: ssrData?.skjema?.inntekt?.endringAarsaker ?? []
    };

    const aktivBestemmendeFravaersdag = parseIsoDate(ssrData?.skjema?.inntekt?.inntektsdato);

    const aktiveNaturalytelser =
      ssrData?.skjema?.naturalytelser && Array.isArray(ssrData.skjema.naturalytelser)
        ? (ssrData.skjema.naturalytelser as any[]).map((ytelse) => ({
            ...ytelse,
            sluttdato: ytelse.sluttdato ? parseIsoDate(ytelse.sluttdato) : undefined
          }))
        : [];

    const aktivFullLonnIArbeidsgiverPerioden = {
      status:
        ssrData?.skjema?.agp?.redusertLoennIAgp?.beloep === undefined ||
        ssrData?.skjema?.agp?.redusertLoennIAgp?.beloep === null
          ? 'Ja'
          : 'Nei',
      begrunnelse: ssrData?.skjema?.agp?.redusertLoennIAgp?.begrunnelse,
      utbetalt: ssrData?.skjema?.agp?.redusertLoennIAgp?.beloep
    };

    const aktivLonnISykefravaeret = {
      status:
        ssrData?.skjema?.refusjon?.beloepPerMaaned !== undefined && ssrData?.skjema?.refusjon?.beloepPerMaaned !== null
          ? 'Ja'
          : 'Nei',
      beloep: ssrData?.skjema?.refusjon?.beloepPerMaaned
    };

    const mottatt = (ssrData?.skjema as any)?.mottatt;
    const ssrInnsendingTidspunkt = mottatt
      ? ` - ${formatDate(new Date(mottatt))} kl. ${formatTime(new Date(mottatt))}`
      : '';

    const aktivRefusjonEndringer = ssrData?.skjema?.refusjon?.endringer || [];
    return {
      aktiveSykmeldingsperioder,
      aktiveArbeidsgiverperioder,
      aktivBruttoinntekt,
      aktivBestemmendeFravaersdag,
      aktiveNaturalytelser,
      aktivFullLonnIArbeidsgiverPerioden,
      aktivLonnISykefravaeret,
      aktivInnsendingTidspunkt: ssrInnsendingTidspunkt,
      aktivAvsender: ssrData?.avsender,
      aktivSykmeldt: ssrData?.sykmeldt,
      aktivRefusjonEndringer
    };
  }, [
    dataFraBackend,
    ssrData,
    kvitteringData,
    sykmeldingsperioder,
    arbeidsgiverperioder,
    bruttoinntekt,
    bestemmendeFravaersdag,
    naturalytelser,
    storeInnsendingTidspunkt
  ]);
}
