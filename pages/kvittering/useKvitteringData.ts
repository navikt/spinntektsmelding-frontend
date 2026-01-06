import { isValid } from 'date-fns';
import { useMemo } from 'react';
import { Periode } from '../../state/state';
import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';
import { ApiPeriodeSchema } from '../../schema/ApiPeriodeSchema';
import z from 'zod';
import { MottattKvittering } from '../../state/useKvitteringInit';

type ApiPeriode = z.infer<typeof ApiPeriodeSchema>;

interface StoreData {
  bruttoinntekt: any;
  lonnISykefravaeret: any;
  fullLonnIArbeidsgiverPerioden: any;
  sykmeldingsperioder: Periode[] | undefined;
  egenmeldingsperioder: any;
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
    lonnISykefravaeret,
    fullLonnIArbeidsgiverPerioden,
    sykmeldingsperioder,
    egenmeldingsperioder,
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
        aktiveEgenmeldinger: egenmeldingsperioder,
        aktiveArbeidsgiverperioder: arbeidsgiverperioder,
        aktivBruttoinntekt: bruttoinntekt,
        aktivBestemmendeFravaersdag: bestemmendeFravaersdag,
        aktiveNaturalytelser: naturalytelser,
        aktivFullLonnIArbeidsgiverPerioden: fullLonnIArbeidsgiverPerioden,
        aktivLonnISykefravaeret: lonnISykefravaeret,
        aktivInnsendingTidspunkt: storeInnsendingTidspunkt,
        aktivAvsender: undefined,
        aktivSykmeldt: undefined
      };
    }

    const aktiveSykmeldingsperioder = ssrData?.sykmeldingsperioder.map((periode: ApiPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom)
    })) as Periode[];

    const aktiveEgenmeldinger = ssrData?.skjema?.agp?.egenmeldinger;

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
      status: ssrData?.skjema?.agp?.redusertLoennIAgp?.beloep === undefined ? 'Ja' : 'Nei',
      begrunnelse: ssrData?.skjema?.agp?.redusertLoennIAgp?.begrunnelse,
      utbetalt: ssrData?.skjema?.agp?.redusertLoennIAgp?.beloep
    };

    const aktivLonnISykefravaeret = {
      status: ssrData?.skjema?.refusjon ? 'Ja' : 'Nei',
      beloep: ssrData?.skjema?.refusjon?.beloepPerMaaned
    };

    const mottatt = (ssrData?.skjema as any)?.mottatt;
    const ssrInnsendingTidspunkt = mottatt
      ? ` - ${formatDate(new Date(mottatt))} kl. ${formatTime(new Date(mottatt))}`
      : '';

    return {
      aktiveSykmeldingsperioder,
      aktiveEgenmeldinger,
      aktiveArbeidsgiverperioder,
      aktivBruttoinntekt,
      aktivBestemmendeFravaersdag,
      aktiveNaturalytelser,
      aktivFullLonnIArbeidsgiverPerioden,
      aktivLonnISykefravaeret,
      aktivInnsendingTidspunkt: ssrInnsendingTidspunkt,
      aktivAvsender: ssrData?.avsender,
      aktivSykmeldt: ssrData?.sykmeldt
    };
  }, [
    dataFraBackend,
    ssrData,
    sykmeldingsperioder,
    egenmeldingsperioder,
    arbeidsgiverperioder,
    bruttoinntekt,
    bestemmendeFravaersdag,
    naturalytelser,
    fullLonnIArbeidsgiverPerioden,
    lonnISykefravaeret,
    storeInnsendingTidspunkt
  ]);
}
