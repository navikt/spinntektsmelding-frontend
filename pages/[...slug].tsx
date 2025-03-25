import React, { useEffect, useMemo, useState } from 'react';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BodyLong, Button, ConfirmationPanel, Link } from '@navikt/ds-react';

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
import Feilsammendrag from '../components/Feilsammendrag';

import BannerUtenVelger from '../components/BannerUtenVelger/BannerUtenVelger';
import environment from '../config/environment';

import Arbeidsgiverperiode from '../components/Arbeidsgiverperiode/Arbeidsgiverperiode';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from '../components/HentingAvDataFeilet';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import { logger } from '@navikt/next-logger';
import useSendInnSkjema from '../utils/useSendInnSkjema';

import { SkjemaStatus } from '../state/useSkjemadataStore';
import useSendInnArbeidsgiverInitiertSkjema from '../utils/useSendInnArbeidsgiverInitiertSkjema';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { isEqual, startOfMonth } from 'date-fns';
import { finnFravaersperioder } from '../state/useEgenmeldingStore';
import useTidligereInntektsdata from '../utils/useTidligereInntektsdata';
import isValidUUID from '../utils/isValidUUID';
import useHentSkjemadata from '../utils/useHentSkjemadata';
import Heading3 from '../components/Heading3';
import forespoerselType from '../config/forespoerselType';
import { hovedskjemaSchema } from '../schema/hovedskjemaSchema';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug,
  erEndring
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [lasterData, setLasterData] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);

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
  const [
    hentPaakrevdOpplysningstyper,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    initBruttoinntekt,
    bruttoinntekt,
    beloepArbeidsgiverBetalerISykefravaeret,
    avsender,
    sykmeldt
  ] = useBoundStore((state) => [
    state.hentPaakrevdOpplysningstyper,
    state.arbeidsgiverKanFlytteSkjæringstidspunkt,
    state.initBruttoinntekt,
    state.bruttoinntekt,
    state.beloepArbeidsgiverBetalerISykefravaeret,
    state.avsender,
    state.sykmeldt
  ]);

  const [sisteInntektsdato, setSisteInntektsdato] = useState<Date | undefined>(undefined);

  const hentSkjemadata = useHentSkjemadata();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen, 'Hovedskjema');
  const sendInnArbeidsgiverInitiertSkjema = useSendInnArbeidsgiverInitiertSkjema(
    setIngenTilgangOpen,
    'HovedskjemaArbeidsgiverInitiert',
    skjemastatus
  );

  let opplysningstyper = hentPaakrevdOpplysningstyper();
  const skalViseEgenmelding = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtArbeidsgiverperiode = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtInntekt = opplysningstyper.includes(forespoerselType.inntekt);

  const pathSlug = slug;

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.saksoversiktUrl;
  };

  const selvbestemtInnsending =
    pathSlug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const [overstyrSkalViseAgp, setOverstyrSkalViseAgp] = useState<boolean>(false);
  const skalViseArbeidsgiverperiode = harForespurtArbeidsgiverperiode || overstyrSkalViseAgp;

  type Skjema = z.infer<typeof hovedskjemaSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(hovedskjemaSchema),
    defaultValues: {
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt,
        endringAarsaker: bruttoinntekt.endringAarsaker
      },
      avsenderTlf: avsender.tlf
    }
  });

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isDirty }
  } = methods;

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt !== undefined) {
      setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [bruttoinntekt.bruttoInntekt, setValue]);

  useEffect(() => {
    setValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? null);
  }, [bruttoinntekt.endringAarsaker, setValue]);

  const inntektBeloep = useWatch({
    control: control,
    name: 'inntekt.beloep'
  });

  useEffect(() => {
    if (inntektBeloep !== undefined) {
      beloepArbeidsgiverBetalerISykefravaeret(inntektBeloep);
    }
  }, [beloepArbeidsgiverBetalerISykefravaeret, inntektBeloep]);

  useEffect(() => {
    if (avsender.tlf !== undefined) {
      setValue('avsenderTlf', avsender.tlf);
    }
  }, [avsender.tlf, setValue]);

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    setSenderInn(true);

    if (pathSlug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT) {
      sendInnArbeidsgiverInitiertSkjema(true, pathSlug, isDirtyForm || isDirty, formData).finally(() => {
        setSenderInn(false);
      });

      return;
    }

    if (skalViseArbeidsgiverperiode) {
      opplysningstyper = [...opplysningstyper, forespoerselType.arbeidsgiverperiode];

      setPaakrevdeOpplysninger(opplysningstyper);
    } else if (opplysningstyper.includes(forespoerselType.arbeidsgiverperiode)) {
      opplysningstyper.splice(opplysningstyper.indexOf(forespoerselType.arbeidsgiverperiode), 1);

      setPaakrevdeOpplysninger(opplysningstyper);
    }

    sendInnSkjema(true, opplysningstyper, pathSlug, isDirtyForm || isDirty, formData).finally(() => {
      setSenderInn(false);
    });
  };

  const beregnetBestemmendeFraværsdag = useMemo(() => {
    const altFravaer = finnFravaersperioder(fravaersperioder, egenmeldingsperioder);
    const beregnetBestemmendeFraværsdagISO = finnBestemmendeFravaersdag(
      altFravaer,
      arbeidsgiverperioder,
      foreslaattBestemmendeFravaersdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );
    return parseIsoDate(beregnetBestemmendeFraværsdagISO);
  }, [
    arbeidsgiverperioder,
    egenmeldingsperioder,
    foreslaattBestemmendeFravaersdag,
    fravaersperioder,
    arbeidsgiverKanFlytteSkjæringstidspunkt
  ]);

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag ? startOfMonth(beregnetBestemmendeFraværsdag) : undefined;
  }, [beregnetBestemmendeFraværsdag]);

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      return;
    }
    if (!isValidUUID(pathSlug)) {
      return;
    }
    if (!fravaersperioder) {
      setLasterData(true);
      hentSkjemadata(pathSlug, erEndring)?.finally(() => {
        setLasterData(false);
      });
    } else if (sisteInntektsdato && inntektsdato && !isEqual(inntektsdato, sisteInntektsdato)) {
      if (inntektsdato && isValidUUID(pathSlug)) {
        fetchInntektsdata(environment.inntektsdataUrl, pathSlug, inntektsdato)
          .then((inntektSisteTreMnd) => {
            setTidligereInntekter(inntektSisteTreMnd.data.tidligereInntekter);
            initBruttoinntekt(
              inntektSisteTreMnd.data.beregnetInntekt,
              inntektSisteTreMnd.data.tidligereInntekter,
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

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug, skjemastatus, inntektsdato, fravaersperioder]);

  const { data, error } = useTidligereInntektsdata(
    sykmeldt.fnr!,
    avsender.orgnr!,
    inntektsdato!,
    slug === 'arbeidsgiverInitiertInnsending'
  );

  const sbBruttoinntekt = !error && !inngangFraKvittering ? data?.bruttoinntekt : undefined;
  const sbTidligereInntekt = !error ? data?.tidligereInntekter : undefined;

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />
      <PageContent title='Inntektsmelding'>
        <FormProvider {...methods}>
          <form className={styles.padded} onSubmit={handleSubmit(submitForm)}>
            <Person />

            <Skillelinje />
            <Fravaersperiode lasterData={lasterData} setIsDirtyForm={setIsDirtyForm} skjemastatus={skjemastatus} />

            <Skillelinje />
            {skalViseEgenmelding && (
              <>
                <Egenmelding
                  lasterData={lasterData}
                  setIsDirtyForm={setIsDirtyForm}
                  selvbestemtInnsending={selvbestemtInnsending}
                />
                <Skillelinje />
              </>
            )}

            {skalViseArbeidsgiverperiode && (
              <Arbeidsgiverperiode
                arbeidsgiverperioder={arbeidsgiverperioder}
                setIsDirtyForm={setIsDirtyForm}
                skjemastatus={skjemastatus}
                skalViseArbeidsgiverperiode={overstyrSkalViseAgp}
                onTilbakestillArbeidsgiverperiode={() => setOverstyrSkalViseAgp(false)}
              />
            )}
            {!skalViseArbeidsgiverperiode && (
              <>
                <Heading3 unPadded>Arbeidsgiverperiode</Heading3>
                <BodyLong>
                  Vi trenger ikke informasjon om arbeidsgiverperioden for denne sykmeldingen. Sykemeldingen er en
                  forlengelse av en tidligere sykefraværsperiode. Hvis du mener at det skal være arbeidsgiverperiode kan
                  du endre dette.
                </BodyLong>
                <Button variant='tertiary' onClick={() => setOverstyrSkalViseAgp(true)}>
                  Endre
                </Button>
              </>
            )}

            <Skillelinje />

            {harForespurtInntekt && (
              <Bruttoinntekt
                bestemmendeFravaersdag={beregnetBestemmendeFraværsdag}
                erSelvbestemt={skjemastatus === SkjemaStatus.SELVBESTEMT}
                sbBruttoinntekt={sbBruttoinntekt}
                sbTidligereInntekt={sbTidligereInntekt}
              />
            )}
            {!harForespurtInntekt && (
              <>
                <Heading3 unPadded>Beregnet månedslønn</Heading3>
                <BodyLong>Vi trenger ikke informasjon om inntekt for dette sykefraværet.</BodyLong>
              </>
            )}

            <Skillelinje />

            <RefusjonArbeidsgiver
              setIsDirtyForm={setIsDirtyForm}
              skalViseArbeidsgiverperiode={skalViseArbeidsgiverperiode}
              inntekt={inntektBeloep}
            />

            <Skillelinje />
            <Naturalytelser setIsDirtyForm={setIsDirtyForm} />
            <ConfirmationPanel
              className={styles.confirmationPanel}
              label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
              id='bekreft-opplysninger'
              error={errors.bekreft_opplysninger?.message}
              {...register('bekreft_opplysninger')}
            ></ConfirmationPanel>
            <Feilsammendrag skjemafeil={errors} />
            <div className={styles.outerButtonWrapper}>
              <div className={styles.buttonWrapper}>
                <Button className={styles.sendButton} loading={senderInn} id='knapp-innsending'>
                  Send
                </Button>

                <Link className={styles.lukkelenke} href={environment.saksoversiktUrl}>
                  Lukk
                </Link>
              </div>
            </div>
          </form>
        </FormProvider>
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
      slug: slug[0],
      erEndring: Boolean(slug[1] && slug[1] === 'overskriv')
    }
  };
}
