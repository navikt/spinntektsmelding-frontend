import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
import environment from '../config/environment';
import dataFetcher from '../utils/dataFetcher';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';

const ARBEIDSGIVER_URL = '/im-dialog/api/arbeidsgivere';
const SKJEMADATA_URL = '/im-dialog/api/inntektsmelding';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const router = useRouter();
  const { data: arbeidsgivere, error } = useSWR<Array<Organisasjon>>(ARBEIDSGIVER_URL, dataFetcher);
  const { data: skjemadata, error: skjemadatafeil } = useSWR<MottattData>(SKJEMADATA_URL, dataFetcher);

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
    } else {
      // useSWR   Send inn!
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
    if (skjemadata) {
      initState(skjemadata);

      setRoute(skjemadata.orgnrUnderenhet);
    }
  }, [skjemadata]);

  useEffect(() => {
    console.log('error', error); // eslint-disable-line
    if (error?.status === 401) {
      router.push(environment.loginServiceUrl);
    }
  }, [error]);

  useEffect(() => {
    console.log('error', skjemadatafeil); // eslint-disable-line
    if (skjemadatafeil?.status === 401) {
      router.push(environment.loginServiceUrl);
    }
  }, [skjemadatafeil]);

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
                className={styles.confirmationpanel}
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
