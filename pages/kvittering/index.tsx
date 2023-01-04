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
import { useCallback } from 'react';

const Kvittering: NextPage = () => {
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt.bruttoInntekt);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);

  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);

  const router = useRouter();

  const clickEndre = useCallback(() => router.back(), [router]);

  const harAktiveEgenmeldingsperioder = () => {
    return egenmeldingsperioder.find((periode) => periode.fom || periode.tom) !== undefined;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <div>
        <PageContent title='Kvittering - innsendt inntektsmelding'>
          <main className={`main-content ${styles.padded}`}>
            <Person />

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
                        <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.fom.valueOf()} />
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>{formatCurrency(bruttoinntekt)} kr/måned</BodyShort>
            <Skillelinje />
            <Heading2>Refusjon</Heading2>

            <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
            <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden!} />
            <Heading3>Betaler arbeidsgiver lønn etter arbeidsgiverperioden?</Heading3>
            <LonnUnderSykefravaeret lonn={lonnISykefravaeret!} refusjonskravetOpphoerer={refusjonskravetOpphoerer} />

            <Skillelinje />
            <Heading2>Eventuelle naturalytelser</Heading2>
            <BortfallNaturalytelser ytelser={naturalytelser!} />
            <Skillelinje />
            <BodyShort>Kvittering - innsendt inntektsmelding - 12.05.2021 kl. 12.23</BodyShort>
            <div className={lokalStyles.buttonwrapper + ' skjul-fra-print'}>
              <div className={lokalStyles.innerbuttonwrapper}>
                <ButtonEndre onClick={clickEndre} />

                <Link className={lokalStyles.lukkelenke} href='/'>
                  <a className={lokalStyles.lukkelenke}>Lukk</a>
                </Link>
              </div>
              <ButtonPrint className={lokalStyles.skrivutknapp}>Skriv ut</ButtonPrint>
            </div>
          </main>
        </PageContent>
      </div>
    </div>
  );
};

export default Kvittering;
