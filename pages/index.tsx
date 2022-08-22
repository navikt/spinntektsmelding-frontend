import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';
import Banner from '../components/Banner/Banner';
import Skillelinje from '../components/Skillelinje/Skillelinje';

import useSWR from 'swr';

import styles from '../styles/Home.module.css';

import Script from 'next/script';

import useRoute from '../components/Banner/useRoute';

import Behandlingsdager from '../components/Behandlingsdager';
import Fravaersperiode from '../components/Fravaersperiode/Fravaersperiode';
import Egenmelding from '../components/Egenmelding';
import Bruttoinntekt from '../components/Bruttoinntekt/Bruttoinntekt';
import Arbeidsforhold from '../components/Arbeidsforhold/Arbeidsforhold';
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import submitInntektsmelding from '../utils/submitInntektsmelding';
import MottattData from '../state/MottattData';
import useBoundStore from '../state/useBoundStore';
import Naturalytelser from '../components/Naturalytelser';
import Person from '../components/Person/Person';
import InntektsmeldingSkjema from '../state/state';
import useStateInit from '../state/useStateInit';
import useFyllInnsending from '../state/useFyllInnsending';
import feiltekster from '../utils/feiltekster';
import Feilsammendrag from '../components/Feilsammendrag';

const fetcher = (url: string) => fetch(url).then((data) => data.json());

const ARBEIDSGIVER_URL = '/api/arbeidsgivere';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const { data: arbeidsgivere, error } = useSWR(ARBEIDSGIVER_URL, fetcher);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const setOrgUnderenhet = useBoundStore((state) => state.setOrgUnderenhet);

  const behandlingsperiode = useBoundStore((state) => state.behandlingsperiode);

  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);

  const [fyllFeilmeldinger, visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.fyllFeilmeldinger,
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const initState = useStateInit();
  const fyllInnsending = useFyllInnsending();

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    const skjemaData: InntektsmeldingSkjema = fyllInnsending(opplysningerBekreftet);

    const errorStatus = submitInntektsmelding(skjemaData);

    if (errorStatus.errorTexts) {
      fyllFeilmeldinger(errorStatus.errorTexts);
    }

    console.log(skjemaData); // eslint-disable-line
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (!!event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  useEffect(() => {
    fetch('/api/inntektsmelding').then((mottattData) => {
      mottattData.json().then((jsonData: MottattData) => {
        initState(jsonData);

        setRoute(jsonData.orgnrUnderenhet);
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>
        <Banner
          tittelMedUnderTittel={'Sykepenger'}
          altinnOrganisasjoner={arbeidsgivere}
          onOrganisasjonChange={setOrgUnderenhet}
        />
        <PageContent title='Inntektsmelding'>
          <main className='main-content'>
            <form className={styles.padded} onSubmit={submitForm}>
              <Person />

              {arbeidsforhold && arbeidsforhold.length > 1 && (
                <>
                  <Skillelinje />
                  <Arbeidsforhold />
                </>
              )}

              <Behandlingsdager />

              {egenmeldingsperioder && (
                <>
                  <Skillelinje />
                  {arbeidsforhold && <Egenmelding />}
                </>
              )}

              {!behandlingsperiode && (
                <>
                  <Skillelinje />
                  <Fravaersperiode />
                </>
              )}

              <Skillelinje />

              <Bruttoinntekt />

              <Skillelinje />

              <RefusjonArbeidsgiver />

              <Skillelinje />
              <Naturalytelser />
              <ConfirmationPanel
                checked={opplysningerBekreftet}
                onClick={clickOpplysningerBekreftet}
                label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                id='bekreft-opplysninger'
                error={visFeilmeldingsTekst('bekreft-opplysninger')}
              >
                NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke
                er riktige eller fullstendige.
              </ConfirmationPanel>
              <Feilsammendrag />
              <Button className={styles.sendbutton}>Send</Button>
            </form>
          </main>
        </PageContent>
        <div id='decorator-env' data-src='https://www.nav.no/dekoratoren/env?context=arbeidsgiver'></div>
        <Script type='text/javascript' src='https://www.nav.no/dekoratoren/client.js'></Script>
      </div>
    </div>
  );
};

export default Home;
