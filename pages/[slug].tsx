import React, { use, useEffect, useMemo, useState } from 'react';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import { Button, ConfirmationPanel, Link } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';

import Skillelinje from '../components/Skillelinje/Skillelinje';

import styles from '../styles/Home.module.css';

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
import fetchInntektsdata from '../utils/fetchInntektsdata';
import { logger } from '@navikt/next-logger';
import useSendInnSkjema from '../utils/useSendInnSkjema';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import useSendInnArbeidsgiverInitiertSkjema from '../utils/useSendInnArbeidsgiverInitiertSkjema';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { isEqual, startOfMonth } from 'date-fns';
import { finnFravaersperioder } from '../state/useEgenmeldingStore';
import useTidligereInntektsdata from '../utils/useTidligereInntektsdata';
import isValidUUID from '../utils/isValidUUID';
import useHentSkjemadata from '../utils/useHentSkjemadata';
import useSkjemadataForespurt from '../utils/useSkjemadataForespurt';
import useStateInit from '../state/useStateInit';
import { Opplysningstype } from '../state/useForespurtDataStore';
import skjemaVariant from '../config/skjemavariant';
import forespoerselType from '../config/forespoerselType';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import paakrevdOpplysningstyper from '../utils/paakrevdeOpplysninger';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [lasterData, setLasterData] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);

  const [skjemastatus, inngangFraKvittering] = useBoundStore((state) => [
    state.skjemastatus,
    state.inngangFraKvittering
  ]);

  const {
    data: forespurtData,
    error: forespurtDataError,
    isLoading: forespurtDataIsLoading
  } = useSkjemadataForespurt(slug, skjemastatus !== SkjemaStatus.SELVBESTEMT) as {
    data: ForespurtData;
    error: any;
    isLoading: boolean;
  };

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  // const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const bestemmendeFravaersdag = !forespurtDataIsLoading
    ? parseIsoDate(forespurtData.bestemmendeFravaersdag)
    : undefined;
  const foreslaattBestemmendeFravaersdag =
    !forespurtDataIsLoading && forespurtData.eksternBestemmendeFravaersdag
      ? parseIsoDate(forespurtData.eksternBestemmendeFravaersdag)
      : undefined;
  // const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  // const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  // const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const [arbeidsgiverKanFlytteSkjæringstidspunkt, initBruttoinntekt] = useBoundStore((state) => [
    state.arbeidsgiverKanFlytteSkjæringstidspunkt,
    state.initBruttoinntekt
  ]);
  // const initState = useStateInit();
  const router = useRouter();

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);

  const searchParams = useSearchParams();
  // const hentSkjemadata = useHentSkjemadata();

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

  const selvbestemtInnsending =
    pathSlug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setSenderInn(true);

    if (pathSlug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT) {
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

  const fravaersperioder = forespurtData?.fravaersperioder.map((periode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: periode.fom + periode.tom
  }));

  const arbeidsgiverperioder = finnArbeidsgiverperiode(fravaersperioder);

  const beregnetBestemmendeFraværsdag = useMemo(() => {
    if (forespurtDataIsLoading) return undefined;

    const altFravaer = finnFravaersperioder(fravaersperioder, egenmeldingsperioder ?? []);
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
    bestemmendeFravaersdag,
    forespurtDataIsLoading
  ]);

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag && !forespurtDataIsLoading
      ? startOfMonth(beregnetBestemmendeFraværsdag)
      : undefined;
  }, [beregnetBestemmendeFraværsdag, forespurtDataIsLoading]);

  const skalHenteInntektsdata =
    (!forespurtDataIsLoading &&
      forespurtData.bestemmendeFravaersdag &&
      startOfMonth(parseIsoDate(forespurtData.bestemmendeFravaersdag)!) === inntektsdato) ||
    slug === 'arbeidsgiverInitiertInnsending';

  const { data, error } = useTidligereInntektsdata(
    identitetsnummer!,
    orgnrUnderenhet!,
    startOfMonth(inntektsdato!),
    slug,
    skalHenteInntektsdata
  );

  console.log(forespurtData, forespurtDataError);

  const sbBruttoinntekt = !error && !inngangFraKvittering ? data?.bruttoinntekt : undefined;
  const sbTidligerinntekt = !error ? data?.tidligereInntekter : undefined;
  const opplysningstyper = !forespurtDataIsLoading
    ? paakrevdOpplysningstyper(forespurtData.forespurtData)
    : (Object.keys(skjemaVariant) as Array<Opplysningstype>);

  useEffect(() => {
    if (!forespurtDataIsLoading && forespurtData && !inngangFraKvittering) {
      // initState(forespurtData);

      // setPaakrevdeOpplysninger(opplysningstyper);

      if (!isOpplysningstype(forespoerselType.arbeidsgiverperiode, opplysningstyper)) {
        router.replace(`/endring/${pathSlug}`, undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forespurtData, inngangFraKvittering, router, forespurtDataIsLoading, opplysningstyper]);

  const personData = {
    navn: forespurtData?.navn,
    identitetsnummer: forespurtData?.identitetsnummer,
    virksomhetsnavn: forespurtData?.orgNavn,
    orgnrUnderenhet: forespurtData?.orgnrUnderenhet,
    innsenderNavn: forespurtData?.innsenderNavn,
    innsenderTelefonNr: forespurtData?.telefonnummer ?? ''
  };
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
          <Person personData={personData} />

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
            perioder={forespurtData?.fravaersperioder}
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

export function isOpplysningstype(value: string, opplysningstyper: (Opplysningstype | undefined)[]): boolean {
  return opplysningstyper.includes(value as Opplysningstype);
}
