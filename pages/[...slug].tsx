import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BodyLong, Button, Checkbox, Link } from '@navikt/ds-react';

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
import Heading3 from '../components/Heading3';
import forespoerselType from '../config/forespoerselType';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { countTrue } from '../utils/countTrue';
import { harEndringAarsak } from '../utils/harEndringAarsak';
import { Behandlingsdager } from '../components/Behandlingsdager/Behandlingsdager';
import Feilmelding from '../components/Feilmelding';
import { SelvbestemtTypeConst } from '../schema/konstanter/selvbestemtType';
import transformErrors from '../utils/transformErrors';
import hentForespoerselSSR from '../utils/hentForespoerselSSR';
import useStateInit from '../state/useStateInit';
import { getToken, validateToken } from '@navikt/oasis';
import { redirectTilLogin } from '../utils/redirectTilLogin';

type Skjema = z.infer<typeof HovedskjemaSchema>;

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug,
  erEndring,
  forespurt,
  forespurtStatus,
  dataFraBackend
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const lasterData = false;
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);

  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const [skjemastatus, inngangFraKvittering] = useBoundStore((state) => [
    state.skjemastatus,
    state.inngangFraKvittering
  ]);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const begrensetForespoersel = useBoundStore((state) => state.begrensetForespoersel);

  const [
    hentPaakrevdOpplysningstyper,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    initBruttoinntekt,
    bruttoinntekt,
    beloepArbeidsgiverBetalerISykefravaeret,
    avsender,
    sykmeldt,
    naturalytelser,
    forespurtData,
    behandlingsdager,
    endringerAvRefusjon,
    selvbestemtType
  ] = useBoundStore((state) => [
    state.hentPaakrevdOpplysningstyper,
    state.arbeidsgiverKanFlytteSkjæringstidspunkt,
    state.initBruttoinntekt,
    state.bruttoinntekt,
    state.beloepArbeidsgiverBetalerISykefravaeret,
    state.avsender,
    state.sykmeldt,
    state.naturalytelser,
    state.forespurtData,
    state.behandlingsdager,
    state.endringerAvRefusjon,
    state.selvbestemtType
  ]);

  const [sisteInntektsdato, setSisteInntektsdato] = useState<Date | undefined>(undefined);
  const [hentInntektEnGang, setHentInntektEnGang] = useState<boolean>(inngangFraKvittering);

  const storeInitialized = useRef(false);

  const initState = useStateInit();

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

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.saksoversiktUrl;
  };

  const selvbestemtInnsending = slug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const behandlingsdagerInnsending =
    slug === 'behandlingsdager' || selvbestemtType === SelvbestemtTypeConst.Behandlingsdager;

  const [overstyrSkalViseAgp, setOverstyrSkalViseAgp] = useState<boolean>(false);
  const skalViseArbeidsgiverperiode = harForespurtArbeidsgiverperiode || overstyrSkalViseAgp;

  const methods = useForm<Skjema>({
    resolver: zodResolver(HovedskjemaSchema),
    defaultValues: {
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt,
        endringAarsaker: [],
        naturalytelser: naturalytelser ?? [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: avsender.tlf
    }
  });

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields }
  } = methods;

  const memoErrors = useMemo(() => transformErrors(errors), [errors]);

  const onForespurtInit = useEffectEvent(() => {
    console.log('onForespurtInit called with dataFraBackend:', forespurt);
    if (dataFraBackend && forespurt && !storeInitialized.current) {
      if (forespurt.data !== null) {
        initState(forespurt.data);
      }
      storeInitialized.current = true;
    }
  });

  useEffect(() => {
    onForespurtInit();
  }, []);

  useEffect(() => {
    if (naturalytelser !== undefined) {
      setValue('inntekt.harBortfallAvNaturalytelser', naturalytelser.length !== 0);
      setValue('inntekt.naturalytelser', naturalytelser);
    }
  }, [naturalytelser, setValue]);

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt !== undefined) {
      setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [bruttoinntekt.bruttoInntekt, setValue]);

  useEffect(() => {
    if (harEndringAarsak(bruttoinntekt.endringAarsaker)) {
      setValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? null);
    }
  }, [bruttoinntekt.endringAarsaker, setValue]);

  useEffect(() => {
    if (avsender.tlf !== undefined) {
      setValue('avsenderTlf', avsender.tlf);
    }
  }, [avsender.tlf, setValue]);

  const inntektBeloep = useWatch({
    control: control,
    name: 'inntekt.beloep'
  });

  useEffect(() => {
    if (inntektBeloep !== undefined && endringerAvRefusjon !== 'Ja') {
      beloepArbeidsgiverBetalerISykefravaeret(inntektBeloep);
    }
  }, [beloepArbeidsgiverBetalerISykefravaeret, inntektBeloep, endringerAvRefusjon]);

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    setSenderInn(true);

    if (selvbestemtInnsending) {
      sendInnArbeidsgiverInitiertSkjema(true, slug, isDirtyForm || isDirty, formData, begrensetForespoersel).finally(
        () => {
          setSenderInn(false);
        }
      );

      return;
    }

    if (skalViseArbeidsgiverperiode) {
      opplysningstyper = [...opplysningstyper, forespoerselType.arbeidsgiverperiode];

      setPaakrevdeOpplysninger(opplysningstyper);
    } else if (opplysningstyper.includes(forespoerselType.arbeidsgiverperiode)) {
      opplysningstyper.splice(opplysningstyper.indexOf(forespoerselType.arbeidsgiverperiode), 1);

      setPaakrevdeOpplysninger(opplysningstyper);
    }

    sendInnSkjema(
      true,
      opplysningstyper,
      slug,
      isDirtyForm || (isDirty && countTrue(dirtyFields) > 1),
      formData,
      begrensetForespoersel
    ).finally(() => {
      setSenderInn(false);
    });
  };

  const mellomregningBeregnetBestemmendeFraværsdag = useMemo(() => {
    if (!harForespurtArbeidsgiverperiode && !overstyrSkalViseAgp) {
      return parseIsoDate(
        forespurtData?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt ?? foreslaattBestemmendeFravaersdag
      );
    }
    const altFravaer = finnFravaersperioder(sykmeldingsperioder, egenmeldingsperioder);
    const beregnetBestemmendeFraværsdagISO = finnBestemmendeFravaersdag(
      altFravaer,
      arbeidsgiverperioder,
      foreslaattBestemmendeFravaersdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt(),
      begrensetForespoersel
    );
    return parseIsoDate(beregnetBestemmendeFraværsdagISO);
  }, [
    arbeidsgiverperioder,
    egenmeldingsperioder,
    foreslaattBestemmendeFravaersdag,
    sykmeldingsperioder,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    harForespurtArbeidsgiverperiode,
    forespurtData?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt,
    begrensetForespoersel,
    overstyrSkalViseAgp
  ]);

  const beregnetBestemmendeFraværsdag = behandlingsdagerInnsending
    ? foreslaattBestemmendeFravaersdag
    : mellomregningBeregnetBestemmendeFraværsdag;

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag ? startOfMonth(beregnetBestemmendeFraværsdag) : undefined;
  }, [beregnetBestemmendeFraværsdag]);

  const onSetHentInntektEnGang = useEffectEvent((status: boolean) => {
    setHentInntektEnGang(status);
  });

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      return;
    }
    if (!isValidUUID(slug)) {
      return;
    }

    if (sykmeldingsperioder && sisteInntektsdato && inntektsdato && !isEqual(inntektsdato, sisteInntektsdato)) {
      if (inntektsdato && (harForespurtArbeidsgiverperiode || hentInntektEnGang) && isValidUUID(slug)) {
        onSetHentInntektEnGang(false);

        fetchInntektsdata(environment.inntektsdataUrl, slug, inntektsdato)
          .then((inntektSisteTreMnd) => {
            const tidligereInntekt = new Map<string, number>(inntektSisteTreMnd.data.historikk);

            setTidligereInntekter(tidligereInntekt);
            initBruttoinntekt(inntektSisteTreMnd.data.gjennomsnitt, tidligereInntekt, inntektsdato);
          })
          .catch((error) => {
            logger.warn('Feil ved henting av tidligere inntektsdata i hovedskjema' + JSON.stringify(error));
          });
      }
      setSisteInntektsdato(inntektsdato);
    }

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, skjemastatus, inntektsdato, sykmeldingsperioder]);

  const { data, error } = useTidligereInntektsdata(
    sykmeldt.fnr!,
    avsender.orgnr!,
    inntektsdato!,
    skjemastatus === SkjemaStatus.SELVBESTEMT && Boolean(inntektsdato)
  );

  const sbBruttoinntekt = !error && !inngangFraKvittering ? data?.gjennomsnitt : undefined;
  const sbTidligereInntekt = !error && data?.historikk ? data?.historikk : undefined;

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
            {skalViseEgenmelding && !behandlingsdagerInnsending && (
              <>
                <Egenmelding
                  lasterData={lasterData}
                  setIsDirtyForm={setIsDirtyForm}
                  selvbestemtInnsending={selvbestemtInnsending}
                />
                <Skillelinje />
              </>
            )}
            {behandlingsdagerInnsending && (
              <Behandlingsdager behandlingsdager={behandlingsdager} arbeidsgiverperioder={arbeidsgiverperioder} />
            )}
            {skalViseArbeidsgiverperiode && !behandlingsdagerInnsending && (
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
              behandlingsdager={behandlingsdagerInnsending}
            />

            <Skillelinje />
            <Naturalytelser />

            <Skillelinje />
            <Checkbox id='bekreft-opplysninger' {...register('bekreft_opplysninger')}>
              Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.
            </Checkbox>
            {errors.bekreft_opplysninger && (
              <Feilmelding id='errors.bekreft_opplysninger'>{errors.bekreft_opplysninger.message}</Feilmelding>
            )}
            <Feilsammendrag skjemafeil={memoErrors} />
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
  const { slug, endre } = context.query;
  const uuid = slug[0];
  const isDevelopment = process.env.NODE_ENV === 'development';
  let forespurt = null;
  let forespurtStatus = null;

  if (isValidUUID(uuid) && !endre) {
    const basePath = `http://${globalThis.process.env.IM_API_URI}${process.env.PREUTFYLT_INNTEKTSMELDING_API}/${uuid}`;
    console.log('basePath:', basePath);
    forespurtStatus = 200;

    const token = getToken(context.req);
    if (!token && !isDevelopment) {
      /* håndter manglende token */
      console.error('Mangler token i header');
      return redirectTilLogin(context);
    }

    const validation = await validateToken(token);
    if (!validation.ok && !isDevelopment) {
      /* håndter valideringsfeil */
      console.error('Validering av token feilet');
      return redirectTilLogin(context);
    }

    try {
      forespurt = await hentForespoerselSSR(uuid, token);
    } catch (error: any) {
      console.error('Error fetching forespurt:', error);
      forespurt = { data: null };
      forespurtStatus = error.status || 500;

      if (error.status === 404) {
        return {
          notFound: true
        };
      }
    }
  }

  return {
    props: {
      slug: slug[0],
      erEndring: Boolean(slug[1] && slug[1] === 'overskriv'),
      forespurt: forespurt,
      forespurtStatus: forespurtStatus,
      dataFraBackend: !!forespurt && !endre
    }
  };
}
