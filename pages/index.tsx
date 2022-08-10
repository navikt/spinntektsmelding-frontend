import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel, ErrorSummary } from '@navikt/ds-react';

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
import submitInntektsmelding, { ValiderTekster } from '../utils/submitInntektsmelding';
import MottattData from '../state/MottattData';
import useArbeidsforholdStore from '../state/useArbeidsforholdStore';
import useEgenmeldingStore from '../state/useEgenmeldingStore';
import Naturalytelser from '../components/Naturalytelser';
import usePersonStore from '../state/usePersonStore';
import Person from '../components/Person/Person';
import InntektsmeldingSkjema from '../state/state';
import useBehandlingsdagerStore from '../state/useBehandlingsdagerStore';
import useStateInit from '../state/useStateInit';
import useFyllInnsending from '../state/useFyllInnsending';

const fetcher = (url: string) => fetch(url).then((data) => data.json());

const ARBEIDSGIVER_URL = '/api/arbeidsgivere';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const { data: arbeidsgivere, error } = useSWR(ARBEIDSGIVER_URL, fetcher);

  const egenmeldingsperioder = useEgenmeldingStore((fstate) => fstate.egenmeldingsperioder);

  const setOrgUnderenhet = usePersonStore((fstate) => fstate.setOrgUnderenhet);

  const behandlingsperiode = useBehandlingsdagerStore((fstate) => fstate.behandlingsperiode);

  const arbeidsforhold = useArbeidsforholdStore((fstate) => fstate.arbeidsforhold);

  const [feilmeldinger, setFeilmeldinger] = useState<Array<ValiderTekster> | undefined>([]);

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const initState = useStateInit();
  const fyllInnsending = useFyllInnsending();

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    const skjemaData: InntektsmeldingSkjema = fyllInnsending(opplysningerBekreftet);

    const errorStatus = submitInntektsmelding(skjemaData);

    setFeilmeldinger(errorStatus.errorTexts);

    console.log(skjemaData); // eslint-disable-line
    console.log(errorStatus); // eslint-disable-line
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
  };

  const harFeilmeldinger = feilmeldinger && feilmeldinger.length > 0;

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

              {behandlingsperiode && (
                <>
                  <Skillelinje />
                  <Behandlingsdager />
                </>
              )}

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
              >
                NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke
                er riktige eller fullstendige.
              </ConfirmationPanel>
              {harFeilmeldinger && (
                <ErrorSummary size='medium' heading='Du må rette disse feilene før du kan sende inn.'>
                  {feilmeldinger?.map((melding) => (
                    <ErrorSummary.Item key={melding.felt} href={`#${melding.felt}`}>
                      {melding.text}
                    </ErrorSummary.Item>
                  ))}
                </ErrorSummary>
              )}
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
