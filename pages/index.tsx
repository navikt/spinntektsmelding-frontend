import React, { useEffect, useReducer, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel, ErrorSummary } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';
import Banner, { Organisasjon } from '../components/Banner/Banner';
import TextLabel from '../components/TextLabel/TextLabel';
import Heading3 from '../components/Heading3/Heading3';
import Skillelinje from '../components/Skillelinje/Skillelinje';

import useSWR from 'swr';

import styles from '../styles/Home.module.css';
import '@navikt/ds-datepicker/lib/index.css';

import formReducer, { initialState } from '../state/formReducer';

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
import useFravaersperiodeStore from '../state/useFravaersperiodeStore';
import useBruttoinntektStore from '../state/useBruttoinntektStore';
import useArbeidsforholdStore from '../state/useArbeidsforholdStore';
import useEgenmeldingStore from '../state/useEgenmeldingStore';
import Naturalytelser from '../components/Naturalytelser';

const fetcher = (url: string) => fetch(url).then((data) => data.json());

const ARBEIDSGIVER_URL = '/api/arbeidsgivere';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const { data, error } = useSWR(ARBEIDSGIVER_URL, fetcher);

  const initFravaersperiode = useFravaersperiodeStore((fstate) => fstate.initFravaersperiode);
  const initBruttoinntekt = useBruttoinntektStore((fstate) => fstate.initBruttioinntekt);
  const initArbeidsforhold = useArbeidsforholdStore((fstate) => fstate.initArbeidsforhold);
  const initEgenmeldingsperiode = useEgenmeldingStore((fstate) => fstate.initEgenmeldingsperiode);

  const arbeidsforhold = useArbeidsforholdStore((fstate) => fstate.arbeidsforhold);
  const egenmeldingsperioder = useEgenmeldingStore((fstate) => fstate.egenmeldingsperioder);

  const [feilmeldinger, setFeilmeldinger] = useState<Array<ValiderTekster> | undefined>([]);
  const [state, dispatch] = useReducer(formReducer, initialState);

  const [arbeidsgivere, setArbeidsgivere] = useState<any>([]);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(state); // eslint-disable-line

    const errorStatus = submitInntektsmelding(state);

    setFeilmeldinger(errorStatus.errorTexts);

    console.log(errorStatus); // eslint-disable-line

    dispatch({
      type: 'submitForm'
    });
  };

  const changeOrgUnderenhet = (organisasjon: Organisasjon) => {
    dispatch({
      type: 'setOrganisasjonUnderenhet',
      payload: organisasjon
    });
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleOpplysningerBekreftet',
      payload: !!event.currentTarget.checked
    });
  };

  const setBehandlingsdager = (behandlingsdager?: Array<Date>) => {
    dispatch({
      type: 'setBehandlingsdager',
      payload: behandlingsdager
    });
  };

  const harFeilmeldinger = feilmeldinger && feilmeldinger.length > 0;

  useEffect(() => {
    fetch('/api/arbeidsgivere').then((mottattData) => {
      mottattData.json().then((jsonData) => {
        setArbeidsgivere(jsonData);
      });
    });
  }, []);

  useEffect(() => {
    fetch('/api/inntektsmelding').then((mottattData) => {
      mottattData.json().then((jsonData: MottattData) => {
        initFravaersperiode(jsonData.fravaersperiode);
        initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekt);
        initArbeidsforhold(jsonData.arbeidsforhold);
        initEgenmeldingsperiode(jsonData.arbeidsforhold, jsonData.egenmeldingsperioder);
        dispatch({
          type: 'fyllFormdata',
          payload: jsonData
        });
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
          onOrganisasjonChange={changeOrgUnderenhet}
        />
        <PageContent title='Inntektsmelding'>
          <main className='main-content'>
            <form className={styles.padded} onSubmit={submitForm}>
              <p>
                For at vi skal utbetale riktig beløp i forbindelse med langvarig sykemelding må dere bekrefte, eller
                oppdatere opplysningene vi har i forbindelse med den ansatte, og sykefraværet.
              </p>
              <div className={styles.personinfowrapper}>
                <div className={styles.denansatte}>
                  <Heading3>Den ansatte</Heading3>
                  <div className={styles.arbeidsgiverwrapper}>
                    <div className={styles.virksomhetsnavnwrapper}>
                      <TextLabel>Navn</TextLabel>
                      <div className={styles.virksomhetsnavn}>{state.navn}</div>
                    </div>
                    <div className={styles.orgnrnavnwrapper}>
                      <TextLabel>Personnummer</TextLabel>
                      {state.identitetsnummer}
                    </div>
                  </div>
                </div>
                <div className={styles['size-resten']}>
                  <Heading3>Arbeidsgiveren</Heading3>
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

              {arbeidsforhold && arbeidsforhold.length > 1 && (
                <>
                  <Skillelinje />
                  <Arbeidsforhold />
                </>
              )}

              {state.behandlingsdager && state.behandlingsperiode && (
                <>
                  <Skillelinje />
                  <Behandlingsdager periode={state.behandlingsperiode} onSelect={setBehandlingsdager} />
                </>
              )}

              {egenmeldingsperioder && (
                <>
                  <Skillelinje />
                  {arbeidsforhold && <Egenmelding />}
                </>
              )}

              {!state.behandlingsdager && (
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
                checked={state.opplysningerBekreftet}
                onClick={clickOpplysningerBekreftet}
                label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
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
