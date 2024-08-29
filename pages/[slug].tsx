import React, { useEffect, useMemo, useState } from 'react';
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
import useHentKvitteringsdata from '../utils/useHentKvitteringsdata';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from '../components/HentingAvDataFeilet';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import { logger } from '@navikt/next-logger';
import useSendInnSkjema from '../utils/useSendInnSkjema';
import { useSearchParams } from 'next/navigation';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import useSendInnArbeidsgiverInitiertSkjema from '../utils/useSendInnArbeidsgiverInitiertSkjema';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { format, isEqual } from 'date-fns';
import { finnFravaersperioder } from '../state/useEgenmeldingStore';
import useTidligereInntektsdata from '../utils/useTidligereInntektsdata';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [lasterData, setLasterData] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const [skjemastatus, inngangFraKvittering] = useBoundStore((state) => [
    state.skjemastatus,
    state.inngangFraKvittering
  ]);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const [hentPaakrevdOpplysningstyper, arbeidsgiverKanFlytteSkjæringstidspunkt, initBruttoinntekt] = useBoundStore(
    (state) => [
      state.hentPaakrevdOpplysningstyper,
      state.arbeidsgiverKanFlytteSkjæringstidspunkt,
      state.initBruttoinntekt
    ]
  );
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);
  const [sisteInntektsdato, setSisteInntektsdato] = useState<Date | undefined>(undefined);

  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);

  const searchParams = useSearchParams();
  const hentKvitteringsdata = useHentKvitteringsdata();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen, 'Hovedskjema');
  const sendInnArbeidsgiverInitiertSkjema = useSendInnArbeidsgiverInitiertSkjema(
    setIngenTilgangOpen,
    'HovedskjemaArbeidsgiverInitiert',
    skjemastatus
  );

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.saksoversiktUrl;
  };

  const pathSlug = slug || (searchParams.get('slug') as string);

  const selvbestemtInnsending = slug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setSenderInn(true);

    if (slug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT) {
      sendInnArbeidsgiverInitiertSkjema(opplysningerBekreftet, pathSlug, isDirtyForm, {}).finally(() => {
        setSenderInn(false);
      });

      return;
    }

    sendInnSkjema(opplysningerBekreftet, false, pathSlug, isDirtyForm).finally(() => {
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

  const beregnetBestemmendeFraværsdag = useMemo(() => {
    const altFravaer = finnFravaersperioder(fravaersperioder, egenmeldingsperioder);
    const beregnetBestemmendeFraværsdagISO = finnBestemmendeFravaersdag(
      altFravaer,
      arbeidsgiverperioder,
      foreslaattBestemmendeFravaersdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );
    return beregnetBestemmendeFraværsdagISO ? parseIsoDate(beregnetBestemmendeFraværsdagISO) : bestemmendeFravaersdag;
  }, [
    arbeidsgiverperioder,
    egenmeldingsperioder,
    foreslaattBestemmendeFravaersdag,
    fravaersperioder,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    bestemmendeFravaersdag
  ]);

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag
      ? parseIsoDate(format(beregnetBestemmendeFraværsdag, 'yyyy-MM-01'))
      : undefined;
  }, [beregnetBestemmendeFraværsdag]);

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      return;
    }
    if (!fravaersperioder) {
      setLasterData(true);
      hentKvitteringsdata(pathSlug)?.finally(() => {
        setLasterData(false);
      });

      if (bestemmendeFravaersdag) {
        setSisteInntektsdato(parseIsoDate(format(bestemmendeFravaersdag, 'yyyy-MM-01')));
      }
    } else {
      if (sisteInntektsdato && inntektsdato && !isEqual(inntektsdato, sisteInntektsdato)) {
        if (inntektsdato) {
          fetchInntektsdata(environment.inntektsdataUrl, pathSlug, inntektsdato)
            .then((inntektSisteTreMnd) => {
              setTidligereInntekter(inntektSisteTreMnd.tidligereInntekter);
              initBruttoinntekt(
                inntektSisteTreMnd.beregnetInntekt,
                inntektSisteTreMnd.tidligereInntekter,
                inntektsdato
              );
            })
            .catch((error) => {
              logger.warn('Feil ved henting av tidligere inntektsdata i hovedskjema', error);
              logger.warn(error);
            });
        }
        setSisteInntektsdato(inntektsdato);
      }
    }

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug, skjemastatus, inntektsdato, fravaersperioder]);

  const { data, error } = useTidligereInntektsdata(
    identitetsnummer!,
    orgnrUnderenhet!,
    inntektsdato!,
    slug === 'arbeidsgiverInitiertInnsending'
  );

  const sbBruttoinntekt = !error && !inngangFraKvittering ? data?.bruttoinntekt : undefined;
  const sbTidligerinntekt = !error ? data?.tidligereInntekter : undefined;
  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />
      <PageContent title='Inntektsmelding'>
        <form className={styles.padded} onSubmit={submitForm}>
          <Person />

          <Behandlingsdager />

          <Skillelinje />
          <Egenmelding
            lasterData={lasterData}
            setIsDirtyForm={setIsDirtyForm}
            selvbestemtInnsending={selvbestemtInnsending}
          />

          <Skillelinje />
          <Fravaersperiode
            lasterData={lasterData}
            setIsDirtyForm={setIsDirtyForm}
            skjemastatus={skjemastatus}
            selvbestemtInnsending={selvbestemtInnsending}
          />

          <Skillelinje />

          <Arbeidsgiverperiode
            arbeidsgiverperioder={arbeidsgiverperioder}
            setIsDirtyForm={setIsDirtyForm}
            skjemastatus={skjemastatus}
          />

          <Skillelinje />

          <Bruttoinntekt
            bestemmendeFravaersdag={beregnetBestemmendeFraværsdag}
            setIsDirtyForm={setIsDirtyForm}
            erSelvbestemt={skjemastatus === SkjemaStatus.SELVBESTEMT}
            sbBruttoinntekt={sbBruttoinntekt}
            sbTidligereinntekt={sbTidligerinntekt}
          />

          <Skillelinje />

          <RefusjonArbeidsgiver setIsDirtyForm={setIsDirtyForm} />

          <Skillelinje />
          <Naturalytelser setIsDirtyForm={setIsDirtyForm} />
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
              <Button className={styles.sendbutton} loading={senderInn} id='knapp-innsending'>
                Send
              </Button>

              <Link className={styles.lukkelenke} href={environment.saksoversiktUrl}>
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
  const slug = context.query.slug;

  return {
    props: {
      slug
    }
  };
}
