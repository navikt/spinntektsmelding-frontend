import React, { useEffect, useState } from 'react';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel, Link } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';

import Skillelinje from '../components/Skillelinje/Skillelinje';

import styles from '../styles/Home.module.css';

import Behandlingsdager from '../components/Behandlingsdager';
import Fravaersperiode from '../components/Fravaersperiode/Fravaersperiode';
import Egenmelding from '../components/Egenmelding';
import Bruttoinntekt from '../components/Bruttoinntekt/Bruttoinntekt';
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import useBoundStore from '../state/useBoundStore';
import Naturalytelser from '../components/Naturalytelser';
import Person from '../components/Person/Person';
import feiltekster from '../utils/feiltekster';
import Feilsammendrag from '../components/Feilsammendrag';

import BannerUtenVelger from '../components/BannerUtenVelger/BannerUtenVelger';
import environment from '../config/environment';

import Arbeidsgiverperiode from '../components/Arbeidsgiverperiode/Arbeidsgiverperiode';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from '../components/HentingAvDataFeilet';
import { logger } from '@navikt/next-logger';

import useSendInnSkjema from '../utils/useSendInnSkjema';
import fetchKvitteringsdata from '../utils/fetchKvitteringsdata';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useKvitteringInit from '../state/useKvitteringInit';
import { useRouter } from 'next/router';
import useStateInit from '../state/useStateInit';

const Home: NextPage = ({
  slug,
  kvitteringsdata,
  error,
  skjemadata
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  // const firstSlug = slug;
  // const [pathSlug, setPathSlug] = useState<string>(firstSlug);
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const initKvitteringInit = useKvitteringInit();
  const initState = useStateInit();

  console.log('kvitteringsdata', kvitteringsdata);
  console.log('slug', slug);
  console.log('skjemadata', skjemadata);

  useEffect(() => {
    if (kvitteringsdata && slug && (kvitteringsdata.kvitteringEkstern || kvitteringsdata.kvitteringDokument)) {
      console.log('kvitteringsdata', kvitteringsdata);
      initKvitteringInit(kvitteringsdata, slug);
      router.push(`/kvittering/${slug}`, undefined, { shallow: true });
    } else if (skjemadata && kvitteringsdata.status === 'FEILET') {
      initState(skjemadata);
    }
  }, [kvitteringsdata, slug, skjemadata]);

  // useEffect(() => {
  //   setPathSlug(firstSlug);
  // }, [firstSlug]);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const [navn, identitetsnummer, orgnrUnderenhet, virksomhetsnavn, innsenderNavn] = useBoundStore((state) => [
    state.navn,
    state.identitetsnummer,
    state.orgnrUnderenhet,
    state.virksomhetsnavn,
    state.innsenderNavn
  ]);

  // const hentKvitteringsdata = useHentKvitteringsdata();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen);

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.minSideArbeidsgiver;
  };

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setSenderInn(true);

    sendInnSkjema(opplysningerBekreftet, false, pathSlug, 'Hovedskjema').finally(() => {
      setSenderInn(false);
    });
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  // useEffect(() => {
  //   if (!fravaersperioder) {
  //     hentKvitteringsdata(pathSlug);
  //   } else {
  //     if (bestemmendeFravaersdag) {
  //       fetchInntektsdata(environment.inntektsdataUrl, slug, bestemmendeFravaersdag)
  //         .then((inntektSisteTreMnd) => {
  //           setTidligereInntekter(inntektSisteTreMnd.tidligereInntekter);
  //         })
  //         .catch((error) => {
  //           logger.warn('Feil ved henting av tidliger inntektsdata', error);
  //         });
  //     }
  //   }
  //   setSlug(pathSlug);
  //   setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pathSlug]);

  const personStatisk = {
    navn: skjemadata?.navn ?? navn,
    identitetsnummer: skjemadata?.identitetsnummer ?? identitetsnummer,
    orgnrUnderenhet: skjemadata?.orgnrUnderenhet ?? orgnrUnderenhet,
    virksomhetsnavn: skjemadata?.orgNavn ?? virksomhetsnavn,
    innsenderNavn: skjemadata?.innsenderNavn ?? innsenderNavn
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <PageContent title='Inntektsmelding'>
        <form className={styles.padded} onSubmit={submitForm}>
          <Person personStatisk={personStatisk} />

          <Behandlingsdager />

          {egenmeldingsperioder && (
            <>
              <Skillelinje />
              <Egenmelding />
            </>
          )}

          <Skillelinje />
          <Fravaersperiode egenmeldingsperioder={egenmeldingsperioder} />

          <Skillelinje />

          <Arbeidsgiverperiode arbeidsgiverperioder={arbeidsgiverperioder} />

          <Skillelinje />

          <Bruttoinntekt bestemmendeFravaersdag={bestemmendeFravaersdag} />

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
          ></ConfirmationPanel>
          <Feilsammendrag />
          <div className={styles.outerbuttonwrapper}>
            <div className={styles.buttonwrapper}>
              <Button className={styles.sendbutton} loading={senderInn}>
                Send
              </Button>

              <Link className={styles.lukkelenke} href={environment.minSideArbeidsgiver}>
                Lukk
              </Link>
            </div>
          </div>
        </form>
        <IngenTilgang open={ingenTilgangOpen} handleCloseModal={() => setIngenTilgangOpen(false)} />
        <HentingAvDataFeilet open={skjemaFeilet} handleCloseModal={lukkHentingFeiletModal} />
      </PageContent>
    </div>
  );
};

export default Home;

export async function getServerSideProps(context: any) {
  const req = context.req;
  const slug = context.query.slug;
  let kvitteringsdata: any = null;
  let error = null;
  let skjemadata = null;

  const isFirstServerCall = req?.url?.indexOf('_next/data') === -1;

  logger.info('getServerSideProps', isFirstServerCall);

  if (!isFirstServerCall) {
    return { props: {} };
  }

  try {
    kvitteringsdata = await fetchKvitteringsdata(process.env.KVITTERINGSDATA_API!, slug, req);
  } catch (errorStatus) {
    logger.info('Feil ved henting av kvitteringsdata i index' + errorStatus);
    try {
      skjemadata = await fetchInntektskjemaForNotifikasjon(process.env.PREUTFYLT_INNTEKTSMELDING_API!, slug, req);
    } catch (error) {
      logger.error('Feil ved henting av inntektsmelding index', error);
    }
  }

  return {
    props: {
      slug,
      kvitteringsdata,
      error,
      skjemadata
    }
  };
}
