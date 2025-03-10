import { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Skeleton } from '@navikt/ds-react';
import Person from '../../components/Person/Person';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter, useSearchParams } from 'next/navigation';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';

import ButtonPrint from '../../components/ButtonPrint';

import ButtonEndre from '../../components/ButtonEndre';
import formatDate from '../../utils/formatDate';
import { Fragment, useEffect } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import formatTime from '../../utils/formatTime';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isBefore, isValid } from 'date-fns';
import env from '../../config/environment';
import { Periode } from '../../state/state';
import forespoerselType from '../../config/forespoerselType';

import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem';
import isValidUUID from '../../utils/isValidUUID';
import Fravaersperiode from '../../components/kvittering/Fravaersperiode';
import classNames from 'classnames/bind';
import finnBestemmendeFravaersdag from '../../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../../utils/parseIsoDate';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';

const Kvittering: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  kvittid
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hentKvitteringsdata = useHentKvitteringsdata();

  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const kvitteringInnsendt = useBoundStore((state) => state.kvitteringInnsendt);

  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const kvitteringEksterntSystem = useBoundStore((state) => state.kvitteringEksterntSystem);
  const kvitteringSlug = kvittid || searchParams.get('kvittid');
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);

  const refusjonEndringerUtenSkjaeringstidspunkt =
    gammeltSkjaeringstidspunkt && refusjonEndringer
      ? refusjonEndringer
          ?.filter((endring) => {
            if (!endring.dato) return false;
            return !isBefore(endring.dato, gammeltSkjaeringstidspunkt);
          })
          .map((endring) => {
            return {
              beloep: endring.beloep ?? endring.beloep,
              dato: endring.dato
            };
          })
      : refusjonEndringer;

  const clickEndre = () => {
    if (isValidUUID(kvitteringSlug)) {
      router.push(`/${kvitteringSlug}`);
    }
  };

  const lukkHentingFeiletModal = () => {
    window.location.href = env.saksoversiktUrl;
  };

  let innsendingstidspunkt =
    kvitteringInnsendt && isValid(kvitteringInnsendt)
      ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
      : '';

  if (kvitteringEksterntSystem?.tidspunkt) {
    const tidspunkt = new Date(kvitteringEksterntSystem.tidspunkt);
    innsendingstidspunkt =
      tidspunkt && isValid(tidspunkt) ? ` - ${formatDate(tidspunkt)} kl. ${formatTime(tidspunkt)}` : '';
  }

  const ingenArbeidsgiverperioder = !harGyldigeArbeidsgiverperioder(arbeidsgiverperioder);

  const paakrevdeOpplysninger = hentPaakrevdOpplysningstyper();

  const trengerArbeidsgiverperiode = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);

  const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
    fravaersperioder,
    arbeidsgiverperioder,
    foreslaattBestemmendeFravaersdag,
    !trengerArbeidsgiverperiode
  );
  const visningBestemmendeFravaersdag = trengerArbeidsgiverperiode
    ? parseIsoDate(bestemmendeFravaersdag)
    : foreslaattBestemmendeFravaersdag;

  useEffect(() => {
    if (!fravaersperioder && !kvitteringEksterntSystem?.avsenderSystem) {
      if (!kvitteringSlug || kvitteringSlug === '') return;
      hentKvitteringsdata(kvitteringSlug);
    }
    setNyInnsending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kvitteringSlug]);

  useEffect(() => {
    setOpprinneligNyMaanedsinntekt(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visNaturalytelser = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);
  const visArbeidsgiverperiode = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);
  const visFullLonnIArbeidsgiverperioden = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode);
  const visRefusjon = paakrevdeOpplysninger?.includes(forespoerselType.refusjon);

  const cx = classNames.bind(lokalStyles);
  const classNameWrapperFravaer = cx({
    fravaerswrapperwrapper: visArbeidsgiverperiode
  });

  const classNameWrapperSkjaeringstidspunkt = cx({
    infoboks: visArbeidsgiverperiode
  });

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
              mottattDato={innsendingstidspunkt}
              kvitteringId={kvitteringSlug}
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

              <Person erKvittering={true} />
              <Skillelinje />
              <div className={classNameWrapperFravaer}>
                {visArbeidsgiverperiode && (
                  <Fravaersperiode
                    fravaersperioder={fravaersperioder}
                    egenmeldingsperioder={egenmeldingsperioder}
                    paakrevdeOpplysninger={paakrevdeOpplysninger}
                  />
                )}

                <div className={classNameWrapperSkjaeringstidspunkt}>
                  <div className={lokalStyles.ytterstefravaerwrapper}>
                    <div className={lokalStyles.ytrefravaerswrapper}>
                      <Heading2 className={lokalStyles.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                      <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                      <div className={lokalStyles.fravaerwrapper}>
                        <div className={lokalStyles.fravaertid}>Dato</div>
                        <div data-cy='bestemmendefravaersdag'>
                          {visningBestemmendeFravaersdag ? (
                            formatDate(visningBestemmendeFravaersdag)
                          ) : (
                            <Skeleton variant='text' />
                          )}{' '}
                        </div>
                      </div>
                    </div>
                    {visArbeidsgiverperiode && (
                      <div className={lokalStyles.arbeidsgiverperiode}>
                        <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                        {!ingenArbeidsgiverperioder && (
                          <BodyLong>
                            Arbeidsgiver er ansvarlig for å betale ut lønn til den sykmeldte under arbeidsgiverpeioden.
                            Deretter betaler Nav lønn til den syke eller refunderer bedriften.
                          </BodyLong>
                        )}
                        {ingenArbeidsgiverperioder && <BodyLong>Det er ikke arbeidsgiverperiode.</BodyLong>}
                        {arbeidsgiverperioder?.map((periode) => (
                          <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Skillelinje />
              <Heading2>Beregnet månedslønn</Heading2>
              <BodyShort className={lokalStyles.uthevet}>Registrert inntekt</BodyShort>
              <BodyShort>{formatCurrency(bruttoinntekt.bruttoInntekt)} kr/måned</BodyShort>
              {bruttoinntekt.endringAarsak?.aarsak && (
                <>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(bruttoinntekt.endringAarsak.aarsak as string)}
                  <EndringAarsakVisning endringAarsak={bruttoinntekt.endringAarsak} />
                </>
              )}
              {bruttoinntekt.endringAarsaker?.map((endring, endringIndex) => (
                <Fragment key={endringIndex}>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(endring.aarsak as string)}
                  <EndringAarsakVisning endringAarsak={endring} />
                </Fragment>
              ))}
              {(visRefusjon || visFullLonnIArbeidsgiverperioden) && (
                <>
                  <Skillelinje />
                  <Heading2>Refusjon</Heading2>
                  {visFullLonnIArbeidsgiverperioden && (
                    <>
                      <div className={lokalStyles.uthevet}>
                        Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
                      </div>
                      <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden} />
                    </>
                  )}
                  <LonnUnderSykefravaeret
                    loenn={lonnISykefravaeret!}
                    refusjonskravetOpphoerer={refusjonskravetOpphoerer}
                    harRefusjonEndringer={harRefusjonEndringer}
                    refusjonEndringer={refusjonEndringerUtenSkjaeringstidspunkt}
                  />
                </>
              )}
              {visNaturalytelser && (
                <>
                  <Skillelinje />
                  <Heading2>Eventuelle naturalytelser</Heading2>
                  <BortfallNaturalytelser ytelser={naturalytelser!} />
                </>
              )}
              <Skillelinje />
            </>
          )}
          <BodyShort>Kvittering - innsendt inntektsmelding{innsendingstidspunkt}</BodyShort>
          <div className={lokalStyles.buttonWrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              {!kvitteringEksterntSystem?.avsenderSystem && <ButtonEndre onClick={clickEndre} />}
              <Link className={lokalStyles.lukkelenke} href={env.saksoversiktUrl}>
                Lukk
              </Link>
            </div>
            <ButtonPrint className={lokalStyles.skrivutknapp}>Skriv ut</ButtonPrint>
          </div>
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

export async function getServerSideProps(context: any) {
  const kvittid = context.query.kvittid;

  return {
    props: {
      kvittid
    }
  };
}
