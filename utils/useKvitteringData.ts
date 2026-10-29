import { useMemo } from 'react';
import { Inntekt, Naturalytelse, Periode } from '../state/state';
import { MottattKvittering } from '../state/useKvitteringInit';
import { SkjemadataState } from '../state/useSkjemadataStore';
import { KvitteringVisning, lagKvitteringVisning } from './lagKvitteringVisning';

interface StoreData extends Pick<SkjemadataState, 'mottatt' | 'kvitteringEksterntSystem' | 'kvitteringData'> {
  bruttoinntekt: Inntekt;
  sykmeldingsperioder: Periode[] | undefined;
  naturalytelser?: Naturalytelse[];
  arbeidsgiverperioder: Periode[] | undefined;
  gammeltSkjaeringstidspunkt: Date | undefined;
}

interface UseKvitteringDataParams {
  kvittering: MottattKvittering | null;
  dataFraBackend: boolean;
  storeData: StoreData;
}

export function useKvitteringData({
  kvittering,
  dataFraBackend,
  storeData
}: UseKvitteringDataParams): KvitteringVisning {
  const ssrData = kvittering?.kvitteringNavNo;
  const {
    bruttoinntekt,
    sykmeldingsperioder,
    naturalytelser,
    arbeidsgiverperioder,
    mottatt,
    kvitteringEksterntSystem,
    gammeltSkjaeringstidspunkt,
    kvitteringData
  } = storeData;

  return useMemo(() => {
    if (!dataFraBackend) {
      return lagKvitteringVisning({
        sykmeldingsperioder,
        arbeidsgiverperioder,
        inntektBeloep: bruttoinntekt.bruttoInntekt,
        endringAarsaker: bruttoinntekt.endringAarsaker,
        bestemmendeFravaersdag: kvitteringData ? kvitteringData.inntekt?.inntektsdato : gammeltSkjaeringstidspunkt,
        naturalytelser,
        redusertLoennIAgp: kvitteringData?.agp?.redusertLoennIAgp,
        refusjon: kvitteringData?.refusjon,
        mottatt: kvitteringEksterntSystem?.mottatt ?? mottatt
      });
    }

    return lagKvitteringVisning({
      sykmeldingsperioder: ssrData?.sykmeldingsperioder,
      arbeidsgiverperioder: ssrData?.skjema.agp?.perioder,
      inntektBeloep: ssrData?.skjema.inntekt?.beloep,
      endringAarsaker: ssrData?.skjema.inntekt?.endringAarsaker,
      bestemmendeFravaersdag: ssrData?.skjema.inntekt?.inntektsdato,
      naturalytelser: ssrData?.skjema.naturalytelser?.filter((ytelse) => ytelse.sluttdato),
      redusertLoennIAgp: ssrData?.skjema.agp?.redusertLoennIAgp,
      refusjon: ssrData?.skjema.refusjon,
      mottatt: kvittering?.kvitteringEkstern?.mottatt ?? ssrData?.mottatt,
      avsender: ssrData?.avsender,
      sykmeldt: ssrData?.sykmeldt
    });
  }, [
    dataFraBackend,
    kvittering?.kvitteringEkstern?.mottatt,
    ssrData,
    kvitteringData,
    sykmeldingsperioder,
    arbeidsgiverperioder,
    bruttoinntekt,
    gammeltSkjaeringstidspunkt,
    naturalytelser,
    mottatt,
    kvitteringEksterntSystem?.mottatt
  ]);
}
