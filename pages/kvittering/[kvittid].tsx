import { InferGetServerSidePropsType, NextPage, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import styles from '../../styles/Home.module.css';

import { Skeleton } from '@navikt/ds-react';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import { useRouter } from 'next/router';

import useBoundStore from '../../state/useBoundStore';

import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';
import { useEffect, useEffectEvent, useRef } from 'react';
import { isValid } from 'date-fns';
import env from '../../config/environment';
import { Periode } from '../../state/state';
import forespoerselType from '../../config/forespoerselType';

import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem';
import isValidUUID from '../../utils/isValidUUID';
import KvitteringFeil from '../../components/kvittering/KvitteringFeil';
import KvitteringHeader from '../../components/kvittering/KvitteringHeader';
import KvitteringFravaer from '../../components/kvittering/KvitteringFravaer';
import KvitteringInntekt from '../../components/kvittering/KvitteringInntekt';
import KvitteringRefusjon from '../../components/kvittering/KvitteringRefusjon';
import KvitteringNaturalytelser from '../../components/kvittering/KvitteringNaturalytelser';
import KvitteringFooter from '../../components/kvittering/KvitteringFooter';
import PersonVisning from '../../components/Person/PersonVisning';
import useKvitteringInit, { MottattKvittering } from '../../state/useKvitteringInit';
import hentKvitteringsdataSSR from '../../utils/hentKvitteringsdataSSR';
import { getKvitteringServerSideProps } from '../../utils/getKvitteringServerSideProps';
import { useKvitteringData } from '../../utils/useKvitteringData';
import FaisuKvittering from '../../components/FaisuKvittering/FaisuKvittering';

const Kvittering: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  kvittid,
  kvittering,
  kvitteringStatus,
  dataFraBackend = false
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const kvitteringInit = useKvitteringInit();
  const storeInitialized = useRef(false);

  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);

  const mottatt = useBoundStore((state) => state.mottatt);

  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const kvitteringEksterntSystem = useBoundStore((state) => state.kvitteringEksterntSystem);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const kvitteringData = useBoundStore((state) => state.kvitteringData);
  const setArbeidsgiverperiodeDisabled = useBoundStore((state) => state.setArbeidsgiverperiodeDisabled);

  const onSetNyInnsending = useEffectEvent((endring: boolean) => {
    setNyInnsending(endring);
  });

  useEffect(() => {
    onSetNyInnsending(false);
  }, []);

  const onSetOpprinneligNyMaanedsinntekt = useEffectEvent(() => {
    setOpprinneligNyMaanedsinntekt();
  });

  useEffect(() => {
    onSetOpprinneligNyMaanedsinntekt();
  }, []);

  const clickEndre = async () => {
    if (isValidUUID(kvittid)) {
      await router.push(`/${kvittid}?endre=true`, `/${kvittid}`);
    }
  };

  let innsendingTidspunkt = mottatt && isValid(mottatt) ? ` - ${formatDate(mottatt)} kl. ${formatTime(mottatt)}` : '';

  if (kvitteringEksterntSystem?.mottatt) {
    const mottatt = new Date(kvitteringEksterntSystem.mottatt);
    innsendingTidspunkt = isValid(mottatt) ? ` - ${formatDate(mottatt)} kl. ${formatTime(mottatt)}` : '';
  }

  const paakrevdeOpplysninger = hentPaakrevdOpplysningstyper();

  const harForespurtArbeidsgiverperiode = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtInntekt = paakrevdeOpplysninger?.includes(forespoerselType.inntekt);

  const visNaturalytelser = paakrevdeOpplysninger?.includes(forespoerselType.inntekt);
  const visArbeidsgiverperiode = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);
  const visFullLonnIArbeidsgiverperioden =
    paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode) ||
    kvitteringData?.refusjon?.beloepPerMaaned !== undefined;
  const visRefusjon = paakrevdeOpplysninger?.includes(forespoerselType.refusjon);

  // Bruk custom hook for å håndtere data fra enten SSR eller store
  const {
    sykmeldingsperioder: aktiveSykmeldingsperioder,
    arbeidsgiverperioder: aktiveArbeidsgiverperioder,
    inntekt: aktivInntekt,
    bestemmendeFravaersdag: aktivBestemmendeFravaersdag,
    naturalytelser: aktiveNaturalytelser,
    fullLonnIArbeidsgiverperioden: aktivFullLonnIArbeidsgiverPerioden,
    refusjon: aktivRefusjon,
    innsendingTidspunkt: aktivInnsendingTidspunkt,
    avsender: aktivAvsender,
    sykmeldt: aktivSykmeldt
  } = useKvitteringData({
    kvittering,
    dataFraBackend,
    storeData: {
      bruttoinntekt,
      sykmeldingsperioder,
      naturalytelser,
      arbeidsgiverperioder,
      mottatt,
      kvitteringEksterntSystem,
      gammeltSkjaeringstidspunkt,
      kvitteringData
    }
  });

  const ingenAktiveArbeidsgiverperioder = !harGyldigeArbeidsgiverperioder(aktiveArbeidsgiverperioder);

  // Initialiser Zustand-store med SSR-data ved første klient-render
  // Dette sikrer at store har data selv ved page refresh
  const onKvitteringInit = useEffectEvent(() => {
    if (dataFraBackend && kvittering && !storeInitialized.current) {
      kvitteringInit(kvittering);
      storeInitialized.current = true;

      if (ingenAktiveArbeidsgiverperioder) {
        setArbeidsgiverperiodeDisabled(true);
      }
    }
  });

  useEffect(() => {
    onKvitteringInit();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Kvittering for innsendt inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />

      <PageContent title='Kvittering - innsendt inntektsmelding'>
        <div className={`main-content ${styles.padded}`}>
          {kvitteringEksterntSystem?.avsenderSystem && (
            <KvitteringAnnetSystem
              arkivreferanse={kvitteringEksterntSystem.referanse}
              eksterntSystem={kvitteringEksterntSystem.avsenderSystem}
              mottattDato={innsendingTidspunkt}
              kvitteringId={kvittid}
            />
          )}
          {!kvitteringEksterntSystem?.avsenderSystem && (
            <>
              <KvitteringHeader onEndre={clickEndre} />

              <PersonVisning sykmeldt={aktivSykmeldt} avsender={aktivAvsender} />
              {(harForespurtInntekt || harForespurtArbeidsgiverperiode) && <Skillelinje />}
              <KvitteringFravaer
                sykmeldingsperioder={aktiveSykmeldingsperioder}
                arbeidsgiverperioder={aktiveArbeidsgiverperioder}
                bestemmendeFravaersdag={aktivBestemmendeFravaersdag}
                paakrevdeOpplysninger={paakrevdeOpplysninger}
                visArbeidsgiverperiode={visArbeidsgiverperiode}
                visBestemmendeFravaersdag={harForespurtInntekt}
                ingenArbeidsgiverperioder={ingenAktiveArbeidsgiverperioder}
                manglendeFravaersdag={<Skeleton variant='text' />}
              />
              {harForespurtInntekt && <KvitteringInntekt inntekt={aktivInntekt} />}
              <FaisuKvittering arbeidsforhold={kvitteringData?.flereArbeidsforhold} />
              {(visRefusjon || visFullLonnIArbeidsgiverperioden) && (
                <KvitteringRefusjon
                  refusjon={aktivRefusjon}
                  fullLonnIArbeidsgiverperioden={
                    visFullLonnIArbeidsgiverperioden ? aktivFullLonnIArbeidsgiverPerioden : undefined
                  }
                />
              )}
              {visNaturalytelser && (
                <KvitteringNaturalytelser tittel='Naturalytelser' naturalytelser={aktiveNaturalytelser} />
              )}
              <Skillelinje />
            </>
          )}
          <KvitteringFooter
            innsendingTidspunkt={aktivInnsendingTidspunkt}
            saksoversiktUrl={env.saksoversiktUrl}
            onEndre={kvitteringEksterntSystem?.avsenderSystem ? undefined : clickEndre}
          />
        </div>
        <KvitteringFeil kvitteringStatus={kvitteringStatus} />
      </PageContent>
    </div>
  );
};

export default Kvittering;

function harGyldigeArbeidsgiverperioder(arbeidsgiverperioder: Periode[] | undefined): boolean {
  return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
    ? arbeidsgiverperioder?.filter(
        (periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom))
      ).length > 0
    : false;
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ kvittid: string }>) {
  return getKvitteringServerSideProps<MottattKvittering>({
    context,
    fetchKvittering: hentKvitteringsdataSSR,
    checkDataFraBackend: (data, fromSubmit) => !fromSubmit && !!(data?.kvitteringNavNo || data?.kvitteringEkstern),
    errorLogMessage: 'Error fetching kvittering:'
  });
}
