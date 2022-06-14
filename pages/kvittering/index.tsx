import { NextPage } from 'next';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import Heading3 from '../../components/Heading3/Heading3';
import { BodyShort, Button } from '@navikt/ds-react';
import TextLabel from '../../components/TextLabel/TextLabel';
import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import subDays from 'date-fns/subDays';
import { YesNo } from '../../state/state';

const Kvittering: NextPage = () => {
  const state = {
    virksomhetsnavn: 'test',
    orgnrUnderenhet: '123456789',
    fnr: '12345678901',
    navn: 'Ole Olsen',
    egenmeldingsperioder: [
      {
        fra: subDays(new Date(), 14),
        til: subDays(new Date(), 11)
      }
    ],
    fravaersperiode: [
      {
        fra: subDays(new Date(), 11),
        til: subDays(new Date(), 4)
      },
      {
        fra: subDays(new Date(), 4),
        til: subDays(new Date(), 1)
      }
    ],
    arbeidsgiverperiode: [
      {
        fra: subDays(new Date(), 14),
        til: new Date()
      }
    ],
    bruttoinntekt: 42000,
    naturalytelser: [
      {
        bortfallsdato: subDays(new Date(), 14),
        verdi: 1234.34,
        type: 'Bil'
      }
    ],
    fullLonnIArbeidsgiverPerioden: {
      status: 'Nei' as YesNo,
      begrunnelse: 'Har ikke lyst'
    },
    lonnISykefravaeret: {
      status: 'Ja' as YesNo,
      belop: 52000
    }
  };

  const router = useRouter();

  const clickEndre = () => {
    router.push('/');
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
            <div className={styles.personinfowrapper}>
              <div className={styles.denansatte}>
                <Heading2>Den ansatte</Heading2>
                <div className={lokalStyles.ytreansattwrapper}>
                  <div className={lokalStyles.ansattwrapper}>
                    <TextLabel>Navn</TextLabel>
                    <div className={styles.fnr}>{state.navn}</div>
                  </div>
                  <div className={styles.ansattwrapper}>
                    <TextLabel>Fødselsnummer</TextLabel>
                    <div className={styles.fnr}>{state.fnr}</div>
                  </div>
                </div>
              </div>
              <div className={styles['size-resten']}>
                <Heading2>Arbeidsgiveren</Heading2>
                <div className={styles.arbeidsgiverwrapper}>
                  <div className={styles.virksomhetsnavnwrapper}>
                    <TextLabel>Virksomhetsnavn</TextLabel>
                    <div className={styles.virksomhetsnavn}>{state.virksomhetsnavn}</div>
                  </div>
                  <div className={styles.orgnrnavnwrapper}>
                    <TextLabel>Org.nr. for underenhet</TextLabel>
                    {state.orgnrUnderenhet}
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Fraværsperiode</Heading2>
            <div className={lokalStyles.ytterstefravaerwrapper}>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Egenmelding
                </BodyShort>
                {state.egenmeldingsperioder.map((periode) => (
                  <PeriodeFraTil fra={periode.fra} til={periode.til} />
                ))}
              </div>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Bestemmende fraværsdag
                </BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Dato</div>
                  <div>22.22.2022</div>
                </div>
              </div>
            </div>
            <div className={lokalStyles.ytterstefravaerwrapper}>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Fravær knyttet til sykmelding
                </BodyShort>
                {state.fravaersperiode.map((periode, index) => (
                  <PeriodeFraTil fra={periode.fra} til={periode.til} key={index} />
                ))}
              </div>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Arbeidsgiverperiode
                </BodyShort>
                {state.arbeidsgiverperiode.map((periode, index) => (
                  <PeriodeFraTil fra={periode.fra} til={periode.til} key={index} />
                ))}
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>{formatCurrency(state.bruttoinntekt)} kr/måned</BodyShort>
            <Skillelinje />
            <Heading2>Refusjon til arbeidsgiver</Heading2>
            <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
            <FullLonnIArbeidsgiverperioden lonnIPerioden={state.fullLonnIArbeidsgiverPerioden} />
            <Heading3>Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?</Heading3>
            <LonnUnderSykefravaeret lonn={state.lonnISykefravaeret} />
            <Skillelinje />
            <Heading2>Eventuelle naturalytelser</Heading2>
            <BortfallNaturalytelser ytelser={state.naturalytelser} />
            <Skillelinje />
            <BodyShort>Kvittering - innsendt inntektsmelding - 12.05.2021 kl. 12.23</BodyShort>
            <div className={lokalStyles.buttonwrapper}>
              <div className={lokalStyles.innerbuttonwrapper}>
                <Button variant='secondary' onClick={clickEndre}>
                  Endre
                </Button>
                <Link className={lokalStyles.lukkelenke} href='/'>
                  <a className={lokalStyles.lukkelenke}>Lukk</a>
                </Link>
              </div>
              <Button className={lokalStyles.skrivutknapp} variant='tertiary'>
                Skriv ut
              </Button>
            </div>
          </main>
        </PageContent>
      </div>
    </div>
  );
};

export default Kvittering;
