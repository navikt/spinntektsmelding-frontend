import { NextPage } from 'next';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import Heading3 from '../../components/Heading3/Heading3';
import { BodyLong, BodyShort } from '@navikt/ds-react';
import Person from '../../components/Person/Person';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';

import ButtonPrint from '../../components/ButtonPrint';

import ButtonEndre from '../../components/ButtonEndre';
import formatDate from '../../utils/formatDate';
import { useCallback, useEffect, useState } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import useHentSkjemadata from '../../utils/useHentSkjemadata';
import formatTime from '../../utils/formatTime';

const Kvittering: NextPage = () => {
  const router = useRouter();
  const slug = (router.query.kvittid as string) || '';
  const firstSlug = slug;
  const [pathSlug, setPathSlug] = useState<string>(firstSlug);

  const [now, _setNow] = useState<Date>(new Date());

  useEffect(() => {
    setPathSlug(firstSlug);
  }, [firstSlug]);

  const hentSkjemadata = useHentSkjemadata();

  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const kvitteringSlug = useBoundStore((state) => state.slug);

  const clickEndre = useCallback(
    () => router.push(`/${kvitteringSlug}`, undefined, { shallow: true }),
    [router, kvitteringSlug]
  );

  const harAktiveEgenmeldingsperioder = () => {
    return egenmeldingsperioder.find((periode) => periode.fom || periode.tom) !== undefined;
  };

  useEffect(() => {
    if (!fravaersperioder) {
      hentSkjemadata(pathSlug);
    }
    setNyInnsending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Kvittering for innsendt inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />

      <PageContent title='Kvittering - innsendt inntektsmelding'>
        <div className={`main-content ${styles.padded}`}>
          <Person erKvittering={true} />

          <Skillelinje />
          <div className={lokalStyles.fravaerswrapperwrapper}>
            <div className={lokalStyles.fravaersperiode}>
              <Heading2>Fraværsperiode</Heading2>
              <div className={lokalStyles.ytterstefravaerwrapper}>
                {harAktiveEgenmeldingsperioder() && (
                  <div className={lokalStyles.ytrefravaerswrapper}>
                    <Heading3 className={lokalStyles.sykfravaerstyper}>Egenmelding</Heading3>
                    {egenmeldingsperioder &&
                      egenmeldingsperioder.map((periode) => (
                        <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'egenmelding' + periode.id} />
                      ))}
                  </div>
                )}
              </div>
              <div className={lokalStyles.ytterstefravaerwrapper}>
                <div className={lokalStyles.ytrefravaerswrapper}>
                  <Heading3 className={lokalStyles.sykfravaerstyper}>Sykmelding</Heading3>
                  {fravaersperioder &&
                    fravaersperioder.map((periode) => (
                      <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'fperiode' + periode.id} />
                    ))}
                </div>
              </div>
            </div>
            <div className={lokalStyles.infoboks}>
              <div className={lokalStyles.ytterstefravaerwrapper}>
                <div className={lokalStyles.ytrefravaerswrapper}>
                  <Heading2 className={lokalStyles.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                  <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                  <div className={lokalStyles.fravaerwrapper}>
                    <div className={lokalStyles.fravaertid}>Dato</div>
                    <div>{formatDate(bestemmendeFravaersdag)} </div>
                  </div>
                </div>
                <div className={lokalStyles.arbeidsgiverperiode}>
                  <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                  <BodyLong>
                    Arbeidsgiver er ansvarlig å betale ut lønn til den sykmeldte under arbeidsgiverpeioden, etterpå
                    betaler Nav lønn til den syke eller refunderer bedriften:
                  </BodyLong>
                  {arbeidsgiverperioder &&
                    arbeidsgiverperioder.map((periode, index) => (
                      <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
                    ))}
                </div>
              </div>
            </div>
          </div>
          <Skillelinje />
          <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
          <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
          <BodyShort>{formatCurrency(bruttoinntekt.bruttoInntekt)} kr/måned</BodyShort>
          {bruttoinntekt.endringsaarsak && (
            <>Endret med årsak: {formatBegrunnelseEndringBruttoinntekt(bruttoinntekt.endringsaarsak)}</>
          )}
          <Skillelinje />
          <Heading2>Refusjon</Heading2>

          <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
          <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden!} />
          <Heading3>Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?</Heading3>
          <LonnUnderSykefravaeret
            lonn={lonnISykefravaeret!}
            refusjonskravetOpphoerer={refusjonskravetOpphoerer}
            harRefusjonEndringer={harRefusjonEndringer}
            refusjonEndringer={refusjonEndringer}
          />

          <Skillelinje />
          <Heading2>Eventuelle naturalytelser</Heading2>
          <BortfallNaturalytelser ytelser={naturalytelser!} />
          <Skillelinje />
          <BodyShort>
            Kvittering - innsendt inntektsmelding - {formatDate(now)} kl. {formatTime(now)}
          </BodyShort>
          <div className={lokalStyles.buttonwrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              <ButtonEndre onClick={clickEndre} />

              <Link
                className={lokalStyles.lukkelenke}
                href='https://arbeidsgiver.nav.no/min-side-arbeidsgiver/sak-restore-session'
              >
                Lukk
              </Link>
            </div>
            <ButtonPrint className={lokalStyles.skrivutknapp}>Skriv ut</ButtonPrint>
          </div>
        </div>
      </PageContent>
    </div>
  );
};

export default Kvittering;
