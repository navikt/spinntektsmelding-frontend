import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { evaluateFlags, flagsClient, getDefinitions } from '@unleash/nextjs';
import type { InferGetServerSidePropsType, NextPage, GetServerSidePropsContext } from 'next';
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
import { HovedskjemaSchema, createHovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { countTrue } from '../utils/countTrue';
import { harEndringAarsak } from '../utils/harEndringAarsak';
import { Behandlingsdager } from '../components/Behandlingsdager/Behandlingsdager';
import Feilmelding from '../components/Feilmelding';
import { SelvbestemtTypeConst } from '../schema/konstanter/selvbestemtType';
import transformErrors from '../utils/transformErrors';
import hentForespoerselSSR from '../utils/hentForespoerselSSR';
import useStateInit from '../state/useStateInit';
import { getToken, validateToken } from '@navikt/oasis';
import { useRemoveQueryParam } from '../utils/useRemoveQueryParam';
import { redirectTilLogin } from '../utils/redirectTilLogin';
import hentArbeidsforholdSSR from '../utils/hentArbeidsforholdSSR';
import Faisu from '../components/Faisu/Faisu';
import { Ansettelsesforhold } from '../schema/AnsettelsesforholdSchema';
import fetchArbeidsforhold from '../utils/fetchArbeidsforhold';

const RequestStatus = {
  fulfilled: 'fulfilled',
  rejected: 'rejected',
  pending: 'pending'
} as const;

function createInvalidUuidProps(uuid: string, erEndring: boolean) {
  return {
    props: {
      slug: uuid,
      erEndring,
      forespurt: null,
      forespurtStatus: 404,
      dataFraBackend: false,
      harGradertSykmelding: false,
      harFlereArbeidsforhold: false,
      ansettelsesforhold: null
    }
  };
}

function resolveForespurtStatus(
  forespurtResult: PromiseSettledResult<Awaited<ReturnType<typeof hentForespoerselSSR>>>,
  hasEndreQuery: boolean
) {
  if (forespurtResult.status === RequestStatus.fulfilled) {
    return 200;
  }

  if (forespurtResult.status === RequestStatus.rejected) {
    logger.warn('Feil ved innhenting av forespurt data: %s', forespurtResult.reason?.response?.status);
    return forespurtResult.reason?.response?.status || (hasEndreQuery ? 200 : 500);
  }

  return undefined;
}

function handleRejectedForespurtResult(
  forespurtResult: PromiseSettledResult<Awaited<ReturnType<typeof hentForespoerselSSR>>>,
  context: GetServerSidePropsContext<{ slug: string[] }>
) {
  if (forespurtResult.status !== RequestStatus.rejected) {
    return null;
  }

  logger.warn('Feil ved innhenting av forespurt data: %j', forespurtResult.reason);

  if (forespurtResult.reason?.status === 401) {
    return redirectTilLogin(context);
  }

  if (forespurtResult.reason?.status === 404) {
    return {
      notFound: true
    };
  }

  return null;
}

function createKvitteringRedirect(context: GetServerSidePropsContext<{ slug: string[] }>, uuid: string) {
  const ingress = context.req.headers.host + environment.baseUrl;
  const isLocalhost =
    context.req.headers.host?.startsWith('localhost') || context.req.headers.host?.startsWith('127.0.0.1');
  const protocol = isLocalhost ? 'http' : 'https';
  const destination = `${protocol}://${ingress}/kvittering/${uuid}`;

  return {
    redirect: {
      destination,
      permanent: false
    }
  };
}

async function getValidatedTokenOrRedirect(
  context: GetServerSidePropsContext<{ slug: string[] }>,
  isDevelopment: boolean
) {
  const token = getToken(context.req);

  if (!token && !isDevelopment) {
    logger.warn('Mangler token i header ved innhenting av forespurt data');
    return {
      token: null,
      redirect: redirectTilLogin(context)
    };
  }

  const validation = await validateToken(token ?? '');
  if (!validation.ok && !isDevelopment) {
    logger.warn('Validering av token feilet ved innhenting av forespurt data');
    return {
      token: null,
      redirect: redirectTilLogin(context)
    };
  }

  return {
    token: token ?? '',
    redirect: null
  };
}

function hasMultipleArbeidsforhold(arbeidsforhold: Ansettelsesforhold | null) {
  return Boolean(arbeidsforhold?.ansettelsesforhold && arbeidsforhold.ansettelsesforhold.length > 1);
}

function shouldRedirectToKvittering(
  forespurt: { erBesvart?: boolean } | null,
  overskriv: boolean,
  hasEndreQuery: boolean
) {
  return Boolean(forespurt?.erBesvart && !overskriv && !hasEndreQuery);
}

function logFetchResults(
  uuid: string,
  forespurtResult: PromiseSettledResult<Awaited<ReturnType<typeof hentForespoerselSSR>>>,
  arbeidsforholdResult: PromiseSettledResult<Awaited<ReturnType<typeof hentArbeidsforholdSSR>>>,
  forespurt: Awaited<ReturnType<typeof hentForespoerselSSR>> | null
) {
  logger.info(
    'Innhenting av data for uuid %s fullført. Forespurt status: %s, Arbeidsforhold status: %s',
    uuid,
    forespurtResult.status,
    arbeidsforholdResult.status
  );

  logger.info('Forespurt data: %j', forespurt);

  if (arbeidsforholdResult.status === RequestStatus.rejected) {
    logger.warn('Feil ved innhenting av arbeidsforhold: %j', arbeidsforholdResult.reason);
  }
}

type Skjema = z.infer<typeof HovedskjemaSchema>;

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug,
  erEndring,
  forespurt,
  forespurtStatus,
  dataFraBackend,
  harFlereArbeidsforhold: harFlereArbeidsforholdInitial,
  ansettelsesforhold
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const lasterData = false;
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);
  const [harFlereArbeidsforhold, setHarFlereArbeidsforhold] = useState<boolean>(harFlereArbeidsforholdInitial);

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
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const [
    hentPaakrevdOpplysningstyper,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    initBruttoinntekt,
    bruttoinntekt,
    beloepArbeidsgiverBetalerISykefravaeret,
    avsender,
    sykmeldt,
    naturalytelser,
    behandlingsdager,
    selvbestemtType,
    kvitteringData
  ] = useBoundStore((state) => [
    state.hentPaakrevdOpplysningstyper,
    state.arbeidsgiverKanFlytteSkjæringstidspunkt,
    state.initBruttoinntekt,
    state.bruttoinntekt,
    state.beloepArbeidsgiverBetalerISykefravaeret,
    state.avsender,
    state.sykmeldt,
    state.naturalytelser,
    state.behandlingsdager,
    state.selvbestemtType,
    state.kvitteringData
  ]);

  const sisteInntektsdatoRef = useRef<Date | undefined>(undefined);
  const hentInntektEnGangRef = useRef(inngangFraKvittering);

  const storeInitialized = useRef(false);
  const agpValuesInitialized = useRef(false);

  const initState = useStateInit();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen, 'Hovedskjema');
  const sendInnArbeidsgiverInitiertSkjema = useSendInnArbeidsgiverInitiertSkjema(
    setIngenTilgangOpen,
    'HovedskjemaArbeidsgiverInitiert',
    skjemastatus
  );

  let opplysningstyper = useMemo(() => hentPaakrevdOpplysningstyper(), [hentPaakrevdOpplysningstyper]);
  const skalViseEgenmelding =
    (opplysningstyper.includes(forespoerselType.arbeidsgiverperiode) && !!dataFraBackend) ||
    skjemastatus === SkjemaStatus.SELVBESTEMT;

  const harForespurtArbeidsgiverperiode = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtInntekt = opplysningstyper.includes(forespoerselType.inntekt);

  const lukkHentingFeiletModal = () => {
    if (environment.saksoversiktUrl !== undefined && globalThis.window?.location !== undefined) {
      globalThis.window.location.href = environment.saksoversiktUrl;
    }
  };

  const selvbestemtInnsending = slug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const behandlingsdagerInnsending =
    slug === 'behandlingsdager' || selvbestemtType === SelvbestemtTypeConst.Behandlingsdager;

  const [overstyrSkalViseAgp, setOverstyrSkalViseAgp] = useState<boolean>(false);
  const skalViseArbeidsgiverperiode = harForespurtArbeidsgiverperiode || overstyrSkalViseAgp;

  const skalValidereFaisu = harFlereArbeidsforhold;

  const methods = useForm<Skjema>({
    resolver: zodResolver(createHovedskjemaSchema(skalValidereFaisu)),
    defaultValues: {
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt,
        endringAarsaker: [],
        naturalytelser: naturalytelser ?? [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: avsender.tlf,
      refusjon: {
        beloepPerMaaned: bruttoinntekt.bruttoInntekt,
        isEditing: false,
        harEndringer: undefined,
        endringer: refusjonEndringer && refusjonEndringer.length > 0 ? refusjonEndringer : []
      },
      kreverRefusjon: undefined,
      fullLonn: undefined,
      opplysningstyper: Array.from(new Set(opplysningstyper)),
      agp: {
        redusertLoennIAgp: null
      }
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

  const removeQueryParam = useRemoveQueryParam();

  const onForespurtInit = useEffectEvent(() => {
    if (dataFraBackend && forespurt && !storeInitialized.current) {
      if (forespurt !== null) {
        initState(forespurt);
      }

      removeQueryParam('fromSubmit');
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

  const isEditingRefusjonBeloep = useWatch({
    control,
    name: 'refusjon.isEditing'
  });

  const harRefusjonEndringer = useWatch({
    control,
    name: 'refusjon.harEndringer'
  });

  const onIsEditingRefusjonBeloep = useEffectEvent(() => {
    return isEditingRefusjonBeloep;
  });

  const onSetValue = useEffectEvent((...args: Parameters<typeof setValue>) => {
    setValue(...args);
  });

  const avsenderOrgnummer = useEffectEvent(() => {
    return avsender.orgnr;
  });

  const sykmeldtFnr = useEffectEvent(() => {
    return sykmeldt.fnr;
  });

  useEffect(() => {
    if (!dataFraBackend) {
      const orgnr = avsenderOrgnummer();
      const fnr = sykmeldtFnr();
      const fom = sykmeldingsperioder?.at(0)?.fom;
      const tom = sykmeldingsperioder?.at(-1)?.tom;

      if (!orgnr || !fnr || !fom || !tom) {
        return;
      }

      fetchArbeidsforhold(orgnr, fnr, fom, tom)
        .then((response) => {
          setHarFlereArbeidsforhold(response.ansettelsesforhold != null && response.ansettelsesforhold.length > 1);

          const arbeidsforhold = response.ansettelsesforhold?.map((periode) => ({
            inntekt: undefined,
            yrkesbeskrivelse: periode.yrkesbeskrivelse,
            stillingsprosent: periode.stillingsprosent,
            inkludertISykefravaer: undefined
          }));
          setValue('flereArbeidsforhold.arbeidsforhold', arbeidsforhold, {
            shouldDirty: true,
            shouldValidate: true
          });
        })
        .catch(() => undefined);
    }
  }, [setValue, dataFraBackend, sykmeldingsperioder]);

  useEffect(() => {
    if (ansettelsesforhold) {
      const arbeidsforhold = ansettelsesforhold.ansettelsesforhold.map((periode) => ({
        inntekt: undefined,
        yrkesbeskrivelse: periode.yrkesbeskrivelse,
        stillingsprosent: periode.stillingsprosent,
        inkludertISykefravaer: undefined
      }));
      setValue('flereArbeidsforhold.arbeidsforhold', arbeidsforhold, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [ansettelsesforhold, setValue]);

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt !== undefined) {
      onSetValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
      if (!onIsEditingRefusjonBeloep()) {
        onSetValue('refusjon.beloepPerMaaned', bruttoinntekt.bruttoInntekt);
      }
    }
  }, [bruttoinntekt.bruttoInntekt]);

  useEffect(() => {
    if (agpValuesInitialized.current) {
      return;
    }

    agpValuesInitialized.current = true;

    if (!dataFraBackend && !kvitteringData?.agp?.redusertLoennIAgp) {
      onSetValue('fullLonn', 'Ja');
    } else if (kvitteringData?.agp?.redusertLoennIAgp) {
      onSetValue('fullLonn', 'Nei');
      onSetValue('agp.redusertLoennIAgp.beloep', kvitteringData.agp.redusertLoennIAgp.beloep);
      onSetValue('agp.redusertLoennIAgp.begrunnelse', kvitteringData.agp.redusertLoennIAgp.begrunnelse);
    }
  }, [kvitteringData?.agp?.redusertLoennIAgp, dataFraBackend]);

  useEffect(() => {
    if (
      !dataFraBackend &&
      kvitteringData?.refusjon?.beloepPerMaaned !== undefined &&
      kvitteringData?.refusjon?.beloepPerMaaned !== null
    ) {
      onSetValue('refusjon.beloepPerMaaned', kvitteringData?.refusjon?.beloepPerMaaned ?? 0);
      onSetValue('kreverRefusjon', 'Ja');
      if (kvitteringData?.refusjon?.endringer && kvitteringData.refusjon.endringer.length > 0) {
        const endringer = kvitteringData.refusjon.endringer
          .map((endring) => {
            const startdato = parseIsoDate(endring.startdato);
            if (!startdato) {
              return null;
            }

            return {
              beloep: endring.beloep,
              startdato
            };
          })
          .filter((endring): endring is { beloep: number; startdato: Date } => endring !== null);
        onSetValue('refusjon.endringer', endringer);
        onSetValue('refusjon.harEndringer', 'Ja');
      } else {
        onSetValue('refusjon.harEndringer', 'Nei');
        onSetValue('refusjon.endringer', []);
      }
    } else if (!dataFraBackend && kvitteringData && !kvitteringData.refusjon?.endringer) {
      onSetValue('refusjon.beloepPerMaaned', 0);
      onSetValue('kreverRefusjon', 'Nei');
    }
  }, [kvitteringData, dataFraBackend]);

  useEffect(() => {
    if (harEndringAarsak(bruttoinntekt.endringAarsaker)) {
      onSetValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? null);
    }
  }, [bruttoinntekt.endringAarsaker]);

  useEffect(() => {
    if (avsender.tlf !== undefined) {
      onSetValue('avsenderTlf', avsender.tlf);
    }
  }, [avsender.tlf]);

  const inntektBeloep = useWatch({
    control,
    name: 'inntekt.beloep'
  });

  const onInntektChange = useEffectEvent(() => {
    if (inntektBeloep !== undefined && harRefusjonEndringer !== 'Ja' && !isEditingRefusjonBeloep) {
      beloepArbeidsgiverBetalerISykefravaeret(inntektBeloep);
    }
    if (!isEditingRefusjonBeloep && (dataFraBackend || selvbestemtInnsending)) {
      setValue('refusjon.beloepPerMaaned', inntektBeloep || 0);
    }
  });

  useEffect(() => {
    onInntektChange();
  }, [inntektBeloep]);

  useEffect(() => {
    onSetValue('opplysningstyper', Array.from(new Set(opplysningstyper)));
  }, [opplysningstyper]);

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

    let nesteOpplysningstyper = opplysningstyper;

    if (skalViseArbeidsgiverperiode) {
      nesteOpplysningstyper = Array.from(new Set([...opplysningstyper, forespoerselType.arbeidsgiverperiode]));
    } else if (opplysningstyper.includes(forespoerselType.arbeidsgiverperiode)) {
      nesteOpplysningstyper = opplysningstyper.filter((type) => type !== forespoerselType.arbeidsgiverperiode);
    }

    formData.opplysningstyper = nesteOpplysningstyper;
    setPaakrevdeOpplysninger(nesteOpplysningstyper);
    setValue('opplysningstyper', Array.from(new Set(nesteOpplysningstyper)));

    sendInnSkjema(
      true,
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
      return parseIsoDate(foreslaattBestemmendeFravaersdag);
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
    begrensetForespoersel,
    overstyrSkalViseAgp
  ]);

  const beregnetBestemmendeFraværsdag = behandlingsdagerInnsending
    ? foreslaattBestemmendeFravaersdag
    : mellomregningBeregnetBestemmendeFraværsdag;

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag ? startOfMonth(beregnetBestemmendeFraværsdag) : undefined;
  }, [beregnetBestemmendeFraværsdag]);

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      return;
    }
    if (!isValidUUID(slug)) {
      return;
    }

    const sisteInntektsdato = sisteInntektsdatoRef.current;

    if (sykmeldingsperioder && sisteInntektsdato && inntektsdato && !isEqual(inntektsdato, sisteInntektsdato)) {
      const skalHenteEnGang = hentInntektEnGangRef.current;

      if (inntektsdato && (harForespurtArbeidsgiverperiode || skalHenteEnGang) && isValidUUID(slug)) {
        hentInntektEnGangRef.current = false;

        fetchInntektsdata(environment.inntektsdataUrl, slug, inntektsdato)
          .then((inntektSisteTreMnd) => {
            const tidligereInntekt = new Map<string, number>(inntektSisteTreMnd.data.historikk);
            const tidligereInntektRecord = Object.fromEntries(tidligereInntekt) as Record<string, number | null>;

            setTidligereInntekter(tidligereInntektRecord);
            initBruttoinntekt(inntektSisteTreMnd.data.gjennomsnitt, tidligereInntektRecord, inntektsdato);
          })
          .catch((error) => {
            logger.warn('Feil ved henting av tidligere inntektsdata i hovedskjema' + JSON.stringify(error));
          });
      }
      sisteInntektsdatoRef.current = inntektsdato;
    }

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, skjemastatus, inntektsdato, sykmeldingsperioder]);

  const { data, error } = useTidligereInntektsdata(
    sykmeldt.fnr ?? '',
    avsender.orgnr ?? '',
    inntektsdato,
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
          <form
            className={styles.padded}
            onSubmit={handleSubmit(submitForm, (errors) => console.log('Submit feil:', errors))}
          >
            <Person />
            <Skillelinje />
            <Fravaersperiode lasterData={lasterData} setIsDirtyForm={setIsDirtyForm} skjemastatus={skjemastatus} />
            <Skillelinje />
            {skalViseEgenmelding && !behandlingsdagerInnsending && (
              <>
                <Egenmelding lasterData={lasterData} egenmeldingsperioder={egenmeldingsperioder} />
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
                skalViseEgenmelding={skalViseEgenmelding}
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
                <Button type='button' variant='tertiary' onClick={() => setOverstyrSkalViseAgp(true)}>
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
            <Faisu harGradertSykmeldingOgFlereArbeidsforhold={harFlereArbeidsforhold} />
            <Skillelinje />
            <RefusjonArbeidsgiver
              skalViseArbeidsgiverperiode={skalViseArbeidsgiverperiode}
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
        <HentingAvDataFeilet open={skjemaFeilet || forespurtStatus === 500} handleCloseModal={lukkHentingFeiletModal} />
      </PageContent>
    </div>
  );
};

export default Home;

export async function getServerSideProps(context: GetServerSidePropsContext<{ slug: string[] }>) {
  const definitions = await getDefinitions();
  const unleashContext = {};
  const { toggles } = evaluateFlags(definitions, unleashContext);
  const flags = flagsClient(toggles);

  const faisuEnabled = flags.isEnabled('faisu-inntektsmelding');
  flags.sendMetrics().catch(() => {});

  const { slug, endre } = context.query;
  const uuid = slug?.[0] ?? '';
  const action = slug?.[1];
  const erEndring = action === 'overskriv';
  const hasEndreQuery = Boolean(endre);
  const isDevelopment = process.env.NODE_ENV === 'development';
  let forespurt: Awaited<ReturnType<typeof hentForespoerselSSR>> | null = null;
  let forespurtStatus: number | undefined;
  const overskriv = erEndring;
  let harGradertSykmelding = false;
  let ansettelsesforhold: Ansettelsesforhold | null = null;

  if (!isValidUUID(uuid)) {
    return createInvalidUuidProps(uuid, erEndring);
  }

  const auth = await getValidatedTokenOrRedirect(context, isDevelopment);
  if (auth.redirect) {
    return auth.redirect;
  }

  const [forespurtResult, arbeidsforholdResult] = await Promise.allSettled([
    hentForespoerselSSR(uuid, auth.token),
    hentArbeidsforholdSSR(uuid, auth.token)
  ]);

  forespurt = forespurtResult.status === RequestStatus.fulfilled ? forespurtResult.value : null;
  ansettelsesforhold = arbeidsforholdResult.status === RequestStatus.fulfilled ? arbeidsforholdResult.value : null;

  forespurtStatus = resolveForespurtStatus(forespurtResult, hasEndreQuery);
  logFetchResults(uuid, forespurtResult, arbeidsforholdResult, forespurt);

  const rejectedForespurtResponse = handleRejectedForespurtResult(forespurtResult, context);
  if (rejectedForespurtResponse) {
    return rejectedForespurtResponse;
  }

  const harFlereArbeidsforhold = faisuEnabled && hasMultipleArbeidsforhold(ansettelsesforhold);
  if (harFlereArbeidsforhold) {
    logger.info(
      'Forespurt data inneholder flere ansettelsesforhold: %j',
      ansettelsesforhold?.ansettelsesforhold ?? null
    );
  }

  if (shouldRedirectToKvittering(forespurt, overskriv, hasEndreQuery)) {
    return createKvitteringRedirect(context, uuid);
  }

  return {
    props: {
      slug: uuid,
      erEndring,
      forespurt: hasEndreQuery ? null : forespurt,
      forespurtStatus: forespurtStatus,
      dataFraBackend: !!forespurt && !hasEndreQuery,
      harGradertSykmelding,
      harFlereArbeidsforhold,
      ansettelsesforhold: harFlereArbeidsforhold && ansettelsesforhold ? ansettelsesforhold : null
    }
  };
}
