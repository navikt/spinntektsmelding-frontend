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

const Kvittering: NextPage = () => {
  const state = {
    virksomhetsnavn: 'test',
    orgnrUnderenhet: '123456789',
    fnr: '12345678901',
    navn: 'Ole Olsen'
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
              <div className={styles.size40}>
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
                  <div className={styles.thirdsize}>
                    <TextLabel>Virksomhetsnavn</TextLabel>
                    <div className={styles.virksomhetsnavn}>{state.virksomhetsnavn}</div>
                  </div>
                  <div className={styles['size-resten']}>
                    <TextLabel>Organisasjonsnummer for underenhet</TextLabel>
                    {state.orgnrUnderenhet}
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Fraværsperiode</Heading2>
            <div className={lokalStyles.ytrefravaerwrapper}>
              <div className={lokalStyles.fravaerwrapper}>
                <BodyShort as='h4'>Egenmelding</BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
              </div>
              <div className={lokalStyles.fravaerwrapper}>
                <BodyShort as='h4'>Bestemmende fraværsdag</BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
              </div>
            </div>
            <div className={lokalStyles.ytrefravaerwrapper}>
              <div className={lokalStyles.fravaerwrapper}>
                <BodyShort as='h4'>Fravær knyttet til sykmelding</BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
              </div>
              <div className={lokalStyles.fravaerwrapper}>
                <BodyShort as='h4'>Arbeidsgiverperiode</BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Fra</div>
                  <div>22.22.2022</div>
                </div>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Til</div>
                  <div>22.22.2022</div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>42000 kr/måned</BodyShort>
            <Skillelinje />
            <Heading2>Refusjon til arbeidsgiver</Heading2>
            <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
            Ja
            <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
            Nei
            <Skillelinje />
            <Heading2>Eventuelle naturalytelser</Heading2>
            Nei
            <Skillelinje />
            <BodyShort>Kvittering - innsendt inntektsmelding - 12.05.2021 kl. 12.23</BodyShort>
            <div className={lokalStyles.buttonwrapper}>
              <div className={lokalStyles.innerbuttonwrapper}>
                <Button variant='secondary'>Endre</Button>
                <Link className={lokalStyles.lukkelenke} href='#'>
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
