import React, { useEffect, useReducer, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel, ErrorSummary } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';
import Banner, { Organisasjon } from '../components/Banner/Banner';
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
import usePersonStore from '../state/usePersonStore';
import Person from '../components/Person/Person';
import InntektsmeldingSkjema from '../state/state';
import useRefusjonArbeidsgiverStore from '../state/useRefusjonArbeidsgiverStore';
import useNaturalytelserStore from '../state/useNaturalytelserStore';

const fetcher = (url: string) => fetch(url).then((data) => data.json());

const ARBEIDSGIVER_URL = '/api/arbeidsgivere';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const { data, error } = useSWR(ARBEIDSGIVER_URL, fetcher);

  const [initFravaersperiode, fravaersperiode] = useFravaersperiodeStore((fstate) => [
    fstate.initFravaersperiode,
    fstate.fravaersperiode
  ]);
  const [initBruttoinntekt, bruttoinntekt] = useBruttoinntektStore((fstate) => [
    fstate.initBruttioinntekt,
    fstate.bruttoinntekt
  ]);
  const initArbeidsforhold = useArbeidsforholdStore((fstate) => fstate.initArbeidsforhold);
  const [initEgenmeldingsperiode, egenmeldingsperioder] = useEgenmeldingStore((fstate) => [
    fstate.initEgenmeldingsperiode,
    fstate.egenmeldingsperioder
  ]);
  const [initPerson, navn, identitetsnummer, virksomhetsnavn, orgnrUnderenhet] = usePersonStore((fstate) => [
    fstate.initPerson,
    fstate.navn,
    fstate.identitetsnummer,
    fstate.virksomhetsnavn,
    fstate.orgnrUnderenhet
  ]);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret] = useRefusjonArbeidsgiverStore((fstate) => [
    fstate.fullLonnIArbeidsgiverPerioden,
    fstate.lonnISykefravaeret
  ]);
  const naturalytelser = useNaturalytelserStore((fstate) => fstate.naturalytelser);

  const setOrgUnderenhet = usePersonStore((fstate) => fstate.setOrgUnderenhet);

  const arbeidsforhold = useArbeidsforholdStore((fstate) => fstate.arbeidsforhold);

  const [feilmeldinger, setFeilmeldinger] = useState<Array<ValiderTekster> | undefined>([]);
  const [state, dispatch] = useReducer(formReducer, initialState);

  const [arbeidsgivere, setArbeidsgivere] = useState<any>([]);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(state); // eslint-disable-line

    const skjemaData: InntektsmeldingSkjema = {
      navn: navn,
      identitetsnummer: identitetsnummer,
      virksomhetsnavn: virksomhetsnavn,
      orgnrUnderenhet: orgnrUnderenhet,
      fravaersperiode: fravaersperiode,
      egenmeldingsperioder: egenmeldingsperioder,
      bruttoinntekt: bruttoinntekt,
      fullLonnIArbeidsgiverPerioden: fullLonnIArbeidsgiverPerioden,
      lonnISykefravaeret: lonnISykefravaeret,
      naturalytelser: naturalytelser,
      opplysningerBekreftet: opplysningerBekreftet,
      behandlingsdager: false,
      sammeFravaersperiode: false,
      arbeidsforhold: arbeidsforhold
    };

    const errorStatus = submitInntektsmelding(skjemaData);

    setFeilmeldinger(errorStatus.errorTexts);

    console.log(skjemaData); // eslint-disable-line
    console.log(errorStatus); // eslint-disable-line

    dispatch({
      type: 'submitForm'
    });
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
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
        initPerson(jsonData.navn, jsonData.identitetsnummer, jsonData.orgnrUnderenhet);
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
