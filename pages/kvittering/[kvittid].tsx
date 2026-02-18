import { InferGetServerSidePropsType, NextPage, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Button, HStack, Skeleton } from '@navikt/ds-react';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/navigation';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';

import ButtonPrint from '../../components/ButtonPrint';

import ButtonEndre from '../../components/ButtonEndre';
import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';
import { Fragment, useEffect, useEffectEvent, useRef } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isValid } from 'date-fns';
import env from '../../config/environment';
import { Periode } from '../../state/state';
import forespoerselType from '../../config/forespoerselType';

import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem';
import isValidUUID from '../../utils/isValidUUID';
import Fravaersperiode from '../../components/kvittering/Fravaersperiode';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';
import PersonVisning from '../../components/Person/PersonVisning';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import useKvitteringInit, { MottattKvittering } from '../../state/useKvitteringInit';
import hentKvitteringsdataSSR from '../../utils/hentKvitteringsdataSSR';
import { getKvitteringServerSideProps } from '../../utils/getKvitteringServerSideProps';
import { useKvitteringData } from '../../utils/useKvitteringData';

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
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);

  const kvitteringInnsendt = useBoundStore((state) => state.kvitteringInnsendt);

  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const kvitteringEksterntSystem = useBoundStore((state) => state.kvitteringEksterntSystem);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const kvitteringData = useBoundStore((state) => state.kvitteringData);

  const onSetSkjemaFeilet = useEffectEvent(() => {
    setSkjemaFeilet();
  });

  useEffect(() => {
    if (kvitteringStatus === 500) {
      const harDataIStore = sykmeldingsperioder && sykmeldingsperioder.length > 0;
      if (!harDataIStore) {
        onSetSkjemaFeilet();
      }
    }
  }, [kvitteringStatus, sykmeldingsperioder]);

  // Initialiser Zustand-store med SSR-data ved første klient-render
  // Dette sikrer at store har data selv ved page refresh
  const onKvitteringInit = useEffectEvent(() => {
    if (dataFraBackend && kvittering && !storeInitialized.current) {
      kvitteringInit(kvittering);
      storeInitialized.current = true;
    }
  });

  useEffect(() => {
    onKvitteringInit();
  }, []);

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

  const clickEndre = () => {
    if (isValidUUID(kvittid)) {
      router.push(`/${kvittid}?endre=true`);
    }
  };

  const lukkHentingFeiletModal = () => {
    if (globalThis.window === undefined) return;
    globalThis.window.location.href = env.saksoversiktUrl!;
  };

  let innsendingTidspunkt =
    kvitteringInnsendt && isValid(kvitteringInnsendt)
      ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
      : '';

  if (kvitteringEksterntSystem?.tidspunkt) {
    const tidspunkt = new Date(kvitteringEksterntSystem.tidspunkt);
    innsendingTidspunkt =
      tidspunkt && isValid(tidspunkt) ? ` - ${formatDate(tidspunkt)} kl. ${formatTime(tidspunkt)}` : '';
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

  const classNameWrapperFravaer = visArbeidsgiverperiode ? lokalStyles.fravaerswrapperwrapper : '';
  const classNameWrapperSkjaeringstidspunkt = visArbeidsgiverperiode ? lokalStyles.infoboks : '';

  // Bruk custom hook for å håndtere data fra enten SSR eller store
  const {
    aktiveSykmeldingsperioder,
    aktiveArbeidsgiverperioder,
    aktivBruttoinntekt,
    aktivBestemmendeFravaersdag,
    aktiveNaturalytelser,
    aktivFullLonnIArbeidsgiverPerioden,
    aktivLonnISykefravaeret,
    aktivInnsendingTidspunkt,
    aktivAvsender,
    aktivSykmeldt,
    aktivRefusjonEndringer
  } = useKvitteringData({
    kvittering,
    dataFraBackend,
    storeData: {
      bruttoinntekt,
      lonnISykefravaeret,
      sykmeldingsperioder,
      naturalytelser,
      arbeidsgiverperioder,
      kvitteringInnsendt,
      kvitteringEksterntSystem,
      gammeltSkjaeringstidspunkt,
      kvitteringData
    }
  });

  const ingenAktiveArbeidsgiverperioder = !harGyldigeArbeidsgiverperioder(aktiveArbeidsgiverperioder);

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
              <div className='page-kvittering-header'>
                <Heading2>Kvittering - innsendt inntektsmelding</Heading2>
                <div className='page-content-header-extra'>
                  <ButtonEndre onClick={clickEndre} />
                </div>
              </div>

              <PersonVisning sykmeldt={aktivSykmeldt} avsender={aktivAvsender} />
              {(harForespurtInntekt || harForespurtArbeidsgiverperiode) && <Skillelinje />}
              <div className={classNameWrapperFravaer}>
                {visArbeidsgiverperiode && (
                  <Fravaersperiode
                    sykmeldingsperioder={aktiveSykmeldingsperioder}
                    paakrevdeOpplysninger={paakrevdeOpplysninger}
                  />
                )}

                <div className={classNameWrapperSkjaeringstidspunkt}>
                  <div className={lokalStyles.ytterstefravaerwrapper}>
                    {harForespurtInntekt && (
                      <div className={lokalStyles.ytrefravaerswrapper}>
                        <Heading2 className={lokalStyles.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                        <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                        <div className={lokalStyles.fravaerwrapper}>
                          <div className={lokalStyles.fravaertid}>Dato</div>
                          <div data-cy='bestemmendefravaersdag'>
                            {aktivBestemmendeFravaersdag ? (
                              formatDate(aktivBestemmendeFravaersdag)
                            ) : (
                              <Skeleton variant='text' />
                            )}{' '}
                          </div>
                        </div>
                      </div>
                    )}
                    {visArbeidsgiverperiode && (
                      <div className={lokalStyles.arbeidsgiverperiode}>
                        <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                        {!ingenAktiveArbeidsgiverperioder && (
                          <BodyLong>
                            Arbeidsgiver er ansvarlig for å betale ut lønn til den sykmeldte under arbeidsgiverpeioden.
                            Deretter betaler Nav lønn til den syke eller refunderer bedriften.
                          </BodyLong>
                        )}
                        {ingenAktiveArbeidsgiverperioder && <BodyLong>Det er ikke arbeidsgiverperiode.</BodyLong>}
                        {aktiveArbeidsgiverperioder?.map((periode: Periode) => (
                          <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {harForespurtInntekt && (
                <>
                  <Skillelinje />
                  <Heading2>Beregnet månedslønn</Heading2>
                  <BodyShort className={lokalStyles.uthevet}>Registrert inntekt</BodyShort>
                  <BodyShort>{formatCurrency(aktivBruttoinntekt?.bruttoInntekt)} kr/måned</BodyShort>
                  {aktivBruttoinntekt?.endringAarsaker?.map((endring: EndringAarsak, endringIndex: number) => (
                    <Fragment key={endring.aarsak + endringIndex}>
                      <div className={lokalStyles.uthevet}>Endret med årsak</div>

                      {formatBegrunnelseEndringBruttoinntekt(endring.aarsak as string)}
                      <EndringAarsakVisning endringAarsak={endring} />
                    </Fragment>
                  ))}
                </>
              )}
              {(visRefusjon || visFullLonnIArbeidsgiverperioden) && (
                <>
                  <Skillelinje />
                  <Heading2>Refusjon</Heading2>
                  {visFullLonnIArbeidsgiverperioden && (
                    <>
                      <div className={lokalStyles.uthevet}>
                        Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
                      </div>
                      <FullLonnIArbeidsgiverperioden
                        lonnIPerioden={
                          aktivFullLonnIArbeidsgiverPerioden?.status &&
                          (aktivFullLonnIArbeidsgiverPerioden.status === 'Ja' ||
                            aktivFullLonnIArbeidsgiverPerioden.status === 'Nei')
                            ? aktivFullLonnIArbeidsgiverPerioden
                            : undefined
                        }
                      />
                    </>
                  )}
                  <LonnUnderSykefravaeret
                    loenn={aktivLonnISykefravaeret}
                    harRefusjonEndringer={aktivRefusjonEndringer.length > 0 ? 'Ja' : 'Nei'}
                    refusjonEndringer={aktivRefusjonEndringer}
                  />
                </>
              )}
              {visNaturalytelser && (
                <>
                  <Skillelinje />
                  <Heading2>Naturalytelser</Heading2>
                  <BortfallNaturalytelser ytelser={aktiveNaturalytelser} />
                </>
              )}
              <Skillelinje />
            </>
          )}
          <BodyShort>Kvittering - innsendt inntektsmelding{aktivInnsendingTidspunkt}</BodyShort>
          <HStack justify='space-between' className={lokalStyles.buttonWrapper + ' skjul-fra-print'}>
            <HStack gap='space-64'>
              {!kvitteringEksterntSystem?.avsenderSystem && <ButtonEndre onClick={clickEndre} />}
              <Button variant='tertiary' as='a' href={env.saksoversiktUrl}>
                Lukk
              </Button>
            </HStack>
            <ButtonPrint className={lokalStyles.skrivutknapp}>Skriv ut</ButtonPrint>
          </HStack>
        </div>
        <HentingAvDataFeilet
          open={skjemaFeilet}
          handleCloseModal={lukkHentingFeiletModal}
          title='Henting av kvitteringen feilet'
          ariaLabel='Henting av kvittering feilet'
        />
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
