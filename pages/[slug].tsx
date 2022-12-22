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
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import useBoundStore from '../state/useBoundStore';
import Naturalytelser from '../components/Naturalytelser';
import Person from '../components/Person/Person';
import useStateInit from '../state/useStateInit';
import feiltekster from '../utils/feiltekster';
import Feilsammendrag from '../components/Feilsammendrag';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import dataFetcherArbeidsgivere from '../utils/dataFetcherArbeidsgivere';
import useLoginRedirectPath from '../utils/useLoginRedirectPath';
import useFetchInntektskjemaForNotifikasjon from '../state/useFetchInntektskjemaForNotifikasjon';
import useValiderInntektsmelding from '../utils/useValiderInntektsmelding';
import EndrePerioderModal, { EndrePeriodeRespons } from '../components/EndrePerioderModal/EndrePerioderModal';
import useFyllInnsending, { InnsendingSkjema } from '../state/useFyllInnsending';
import formatIsoDate from '../utils/formatIsoDate';

const ARBEIDSGIVER_URL = '/im-dialog/api/arbeidsgivere';
const SKJEMADATA_URL = '/im-dialog/api/trenger';
const INNSENDING_URL = '/im-dialog/api/innsendingInntektsmelding';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const router = useRouter();
  const slug = (router.query.slug as string) || '';
  const firstSlug = slug;
  const [pathSlug, setPathSlug] = useState<string>(firstSlug);

  useEffect(() => {
    setPathSlug(firstSlug);
  }, [firstSlug]);

  const { data: arbeidsgivere, error } = useSWR<Array<Organisasjon>>(ARBEIDSGIVER_URL, dataFetcherArbeidsgivere);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const setOrgUnderenhet = useBoundStore((state) => state.setOrgUnderenhet);

  const loginPath = useLoginRedirectPath();

  const [fyllFeilmeldinger, visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.fyllFeilmeldinger,
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const [bestemmendeFravaersdag, setBestemmendeFravaersdag] = useBoundStore((state) => [
    state.bestemmendeFravaersdag,
    state.setBestemmendeFravaersdag
  ]);

  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useBoundStore((state) => [
    state.arbeidsgiverperioder,
    state.setArbeidsgiverperioder
  ]);

  const setEndringsbegrunnelse = useBoundStore((state) => state.setEndringsbegrunnelse);

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const initState = useStateInit();

  const hentSkjemadata = useFetchInntektskjemaForNotifikasjon('');

  const validerInntektsmelding = useValiderInntektsmelding();

  const fyllInnsending = useFyllInnsending();

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    const errorStatus = validerInntektsmelding(opplysningerBekreftet);

    if (errorStatus.errorTexts && errorStatus.errorTexts.length > 0) {
      fyllFeilmeldinger(errorStatus.errorTexts);
    } else {
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);
      skjemaData.bestemmendeFraværsdag = formatIsoDate(bestemmendeFravaersdag);
      skjemaData.arbeidsgiverperioder = arbeidsgiverperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      }));
      fyllFeilmeldinger([]);
      const postData = async () => {
        const data = await fetch(INNSENDING_URL, {
          method: 'POST',
          body: JSON.stringify(skjemaData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log(data); // eslint-disable-line
        if (data.status === 201) {
          router.push('/kvittering');
        }
      };
      postData();

      // } else {
      //   fyllFeilmeldinger(errorStatus.errorTexts);
      // }
    }
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (!!event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  const onUpdatePeriodeModal = (data: EndrePeriodeRespons) => {
    setModalOpen(false);
    setBestemmendeFravaersdag(data.bestemmendFraværsdag);
    setArbeidsgiverperioder(data.arbeidsgiverperioder);
    setEndringsbegrunnelse(data.begrunnelse);
  };

  useEffect(() => {
    const hentData = async () => {
      console.log('henter data', pathSlug);
      try {
        let skjemadata;
        if (pathSlug) {
          skjemadata = await hentSkjemadata(SKJEMADATA_URL, pathSlug);
        }
        if (skjemadata) {
          initState(skjemadata);

          setRoute(skjemadata.orgnrUnderenhet, pathSlug);
        }
      } catch (error) {
        console.log('error', error); // eslint-disable-line

        leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
      }
    };

    hentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug]);

  useEffect(() => {
    console.log('error', error); // eslint-disable-line
    if (error?.status === 401) {
      router.push(loginPath());
    }

    if (error?.status === 500) {
      leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_ARBEIDSGIVER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main role='main' id='maincontent' tabIndex={-1}>
        <Banner
          tittelMedUnderTittel={'Sykepenger'}
          altinnOrganisasjoner={arbeidsgivere}
          onOrganisasjonChange={setOrgUnderenhet}
          slug={pathSlug}
        />
        <PageContent title='Inntektsmelding'>
          <main className='main-content'>
            <form className={styles.padded} onSubmit={submitForm}>
              <Person />

              <Behandlingsdager />

              {egenmeldingsperioder && (
                <>
                  <Skillelinje />
                  <Egenmelding />
                </>
              )}

              <Skillelinje />
              <Fravaersperiode egenmeldingsperioder={egenmeldingsperioder} setModalOpen={openModal} />

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
      </main>
      {modalOpen && (
        <EndrePerioderModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          arbeidsgiverperioder={arbeidsgiverperioder || []}
          bestemmendeFravaersdag={bestemmendeFravaersdag || new Date()}
          onUpdate={onUpdatePeriodeModal}
        />
      )}
    </div>
  );
};

export default Home;
