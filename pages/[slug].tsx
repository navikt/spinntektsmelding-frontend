import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
import useHentKvitteringsdata from '../utils/useHentKvitteringsdata';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from '../components/HentingAvDataFeilet';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import { logger } from '@navikt/next-logger';
import useSendInnSkjema from '../utils/useSendInnSkjema';
import getTrenger from '../api/getTrenger';
import { useQuery } from '@tanstack/react-query';
import parseIsoDate from '../utils/parseIsoDate';
import { Periode } from '../state/state';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import { MottattPeriode } from '../state/MottattData';

const Home: NextPage = () => {
  const router = useRouter();

  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [lasterData, setLasterData] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  // const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  // const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  // const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const hentKvitteringsdata = useHentKvitteringsdata();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen);

  const slug = router.query.slug as string;

  const trengerQuery = useQuery({ queryKey: ['trenger', slug], queryFn: () => getTrenger(slug) });
  console.log(trengerQuery);
  const lukkHentingFeiletModal = () => {
    window.location.href = environment.minSideArbeidsgiver;
  };

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setSenderInn(true);

    const pathSlug = router.query.slug as string;

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

  useEffect(() => {
    const pathSlug = router.query.slug as string;
    if (!fravaersperioder) {
      setLasterData(true);
      hentKvitteringsdata(pathSlug)?.finally(() => {
        setLasterData(false);
      });
    } else {
      if (bestemmendeFravaersdag) {
        fetchInntektsdata(environment.inntektsdataUrl, pathSlug, bestemmendeFravaersdag)
          .then((inntektSisteTreMnd) => {
            setTidligereInntekter(inntektSisteTreMnd.tidligereInntekter);
          })
          .catch((error) => {
            logger.warn('Feil ved henting av tidliger inntektsdata i hovedskjema', error);
            logger.warn(error);
          });
      }
    }

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.slug]);

  const fravaersperioder: Array<Periode> = trengerQuery.data?.fravaersperioder?.map((periode: MottattPeriode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: `${periode.fom}-${periode.tom}`
  }));

  const egenmeldingsperioder: Array<Periode> = trengerQuery.data?.egenmeldingsperioder?.map(
    (periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: `${periode.fom}-${periode.tom}`
    })
  );

  const fravaer = fravaersperioder ? fravaersperioder?.concat(egenmeldingsperioder ?? []) : egenmeldingsperioder ?? [];

  const arbeidsgiverperioder: Array<Periode> = fravaer.length > 0 ? finnArbeidsgiverperiode(fravaer) : [];

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
          <Person
            navn={trengerQuery.data?.navn}
            identitetsnummer={trengerQuery.data?.identitetsnummer}
            orgnrUnderenhet={trengerQuery.data?.orgnrUnderenhet}
            orgNavn={trengerQuery.data?.orgNavn}
            innsenderTelefonNr={trengerQuery.data?.innsenderTelefonNr}
            innsenderNavn={trengerQuery.data?.innsenderNavn}
          />

          <Behandlingsdager />

          <Skillelinje />
          <Egenmelding lasterData={lasterData} />

          <Skillelinje />
          <Fravaersperiode fravaersperioder={fravaersperioder} lasterData={trengerQuery.isFetching} />

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
