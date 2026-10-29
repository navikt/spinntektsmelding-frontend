import { Fragment, useEffect, useEffectEvent } from 'react';
import { InferGetServerSidePropsType, NextPage, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../../components/PageContent/PageContent';

import lokalStyling from '../Kvittering.module.css';
import styles from '../../../styles/Home.module.css';

import Heading2 from '../../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Button, HStack } from '@navikt/ds-react';

import Skillelinje from '../../../components/Skillelinje/Skillelinje';
import PeriodeFraTil from '../../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../../state/useBoundStore';

import ButtonPrint from '../../../components/ButtonPrint';

import ButtonEndre from '../../../components/ButtonEndre';
import formatDate from '../../../utils/formatDate';
import formatBegrunnelseEndringBruttoinntekt from '../../../utils/formatBegrunnelseEndringBruttoinntekt';
import EndringAarsakVisning from '../../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isValid } from 'date-fns';

import isValidUUID from '../../../utils/isValidUUID';
import Fravaersperiode from '../../../components/kvittering/Fravaersperiode';
import { harGyldigeRefusjonEndringer } from '../../../utils/harGyldigeRefusjonEndringer';
import hentKvitteringsdataAgiSSR, { SelvbestemtKvitteringResponse } from '../../../utils/hentKvitteringsdataAgiSSR';
import PersonVisning from '../../../components/PersonVisning/PersonVisning';
import { MottattPeriode } from '../../../schema/ForespurtDataSchema';
import useKvitteringInit from '../../../state/useKvitteringInit';

import { SkjemaStatus } from '../../../state/useSkjemadataStore';
import environment from '../../../config/environment';
import { getKvitteringServerSideProps } from '../../../utils/getKvitteringServerSideProps';
import { z } from 'zod';
import { KvitteringNavNoSchema } from '../../../schema/MottattKvitteringSchema';
import { lagKvitteringVisning } from '../../../utils/lagKvitteringVisning';
import { useShallow } from 'zustand/react/shallow';
import KvitteringFeil from '../../../components/kvittering/KvitteringFeil';
import FaisuKvittering from '../../../components/FaisuKvittering/FaisuKvittering';
import FullInnsendingSchema from '../../../schema/FullInnsendingSchema';
import AapenInnsendingSchema from '../../../schema/AapenInnsendingSchema';
import { SelvbestemtInntektsmeldingSchema } from '../../../schema/SelvbestemtKvitteringSchema';

type KvitteringInitData =
  | z.infer<typeof FullInnsendingSchema>
  | z.infer<typeof AapenInnsendingSchema>
  | z.infer<typeof SelvbestemtInntektsmeldingSchema>;

type PersonData = {
  navn: string;
  identitetsnummer: string;
  orgnrUnderenhet: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
};

const Kvittering: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  kvittid,
  kvittering,
  kvitteringStatus,
  dataFraBackend = false
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [
    kvitteringData,
    setNyInnsending,
    setSkjemaStatus,
    setVedtaksperiodeId,
    lagretEndringAarsaker,
    setSelvbestemtType,
    setBehandlingsdager,
    sykmeldt,
    avsender,
    setArbeidsgiverperiodeDisabled
  ] = useBoundStore(
    useShallow((state) => [
      state.kvitteringData,
      state.setNyInnsending,
      state.setSkjemaStatus,
      state.setVedtaksperiodeId,
      state.bruttoinntekt.endringAarsaker,
      state.setSelvbestemtType,
      state.setBehandlingsdager,
      state.sykmeldt,
      state.avsender,
      state.setArbeidsgiverperiodeDisabled
    ])
  );
  const kvitteringInit = useKvitteringInit();
  const lagretMottatt = useBoundStore((state) => state.mottatt);

  const kvitteringDokument = kvittering;

  const visBackendData = dataFraBackend && !!kvitteringDokument;
  const visningskilde = visBackendData ? kvitteringDokument : kvitteringData;
  const aktivSykmeldt = visBackendData ? kvitteringDokument.sykmeldt : sykmeldt;
  const aktivAvsender = visBackendData ? kvitteringDokument.avsender : avsender;
  const personData = {
    navn: aktivSykmeldt.navn,
    identitetsnummer: aktivSykmeldt.fnr,
    orgnrUnderenhet: aktivAvsender.orgnr,
    virksomhetNavn: aktivAvsender.orgNavn,
    innsenderNavn: aktivAvsender.navn,
    innsenderTelefonNr: aktivAvsender.tlf
  };
  const {
    sykmeldingsperioder,
    arbeidsgiverperioder,
    inntekt,
    bestemmendeFravaersdag: visningBestemmendeFravaersdag,
    naturalytelser: visningNaturalytelser,
    fullLonnIArbeidsgiverperioden: fullLoennIArbeidsgiverPerioden,
    refusjon: { loenn, endringer: refusjonEndringer },
    mottatt,
    innsendingTidspunkt
  } = lagKvitteringVisning({
    sykmeldingsperioder:
      visningskilde && 'sykmeldingsperioder' in visningskilde ? visningskilde.sykmeldingsperioder : undefined,
    arbeidsgiverperioder: visningskilde?.agp?.perioder,
    inntektBeloep: visningskilde?.inntekt?.beloep,
    endringAarsaker: visBackendData
      ? visningskilde?.inntekt?.endringAarsaker
      : (visningskilde?.inntekt?.endringAarsaker ?? lagretEndringAarsaker),
    bestemmendeFravaersdag: visningskilde?.inntekt?.inntektsdato,
    naturalytelser: visningskilde?.naturalytelser,
    redusertLoennIAgp: visningskilde?.agp?.redusertLoennIAgp,
    refusjon: visningskilde?.refusjon,
    mottatt: visBackendData ? kvitteringDokument.mottatt : lagretMottatt
  });

  const vedtaksperiodeId =
    kvitteringDokument &&
    'vedtaksperiodeId' in kvitteringDokument &&
    typeof kvitteringDokument.vedtaksperiodeId === 'string'
      ? kvitteringDokument.vedtaksperiodeId
      : undefined;

  const onSetVedtaksperiodeId = useEffectEvent((vedtaksperiodeId: string) => {
    setVedtaksperiodeId(vedtaksperiodeId);
  });

  useEffect(() => {
    if (dataFraBackend && vedtaksperiodeId) {
      onSetVedtaksperiodeId(vedtaksperiodeId);
    }
  }, [dataFraBackend, vedtaksperiodeId]);

  const ingenArbeidsgiverperioder = arbeidsgiverperioder?.length === 0;

  const clickEndre = async () => {
    const input = dataFraBackend ? kvitteringDokument : kvitteringData;
    if (!input) {
      throw new Error('Kan ikke endre inntektsmeldingen uten kvitteringsdata');
    }
    // Må lagre data som kan endres i hovedskjema - Start
    const kvittering = prepareForInitiering(input, personData, mottatt);
    kvitteringInit({ kvitteringNavNo: kvittering, kvitteringEkstern: null });
    // Må lagre data som kan endres i hovedskjema - Slutt
    if (ingenArbeidsgiverperioder) {
      setArbeidsgiverperiodeDisabled(true);
    }
    if (input?.agp?.perioder) {
      setBehandlingsdager(input.agp.perioder.map((periode: MottattPeriode) => periode.fom));
    }

    if (isValidUUID(kvittid)) {
      await router.push(`/${kvittid}?endre=true&agi=true`, `/${kvittid}`);
    }
  };

  const paakrevdeOpplysninger = ['arbeidsgiverperiode', 'naturalytelser', 'refusjon'];

  const onSetNyInnsending = useEffectEvent(() => {
    setNyInnsending(false);
  });

  useEffect(() => {
    onSetNyInnsending();
  }, [router.asPath]);

  const visNaturalytelser = true;
  const visArbeidsgiverperiode = true;
  const visFullLonnIArbeidsgiverperioden = true;

  const classNameWrapperFravaer = visArbeidsgiverperiode ? lokalStyling.fravaerswrapperwrapper : '';
  const classNameWrapperSkjaeringstidspunkt = visArbeidsgiverperiode ? lokalStyling.infoboks : '';

  const onsetSkjemaStatus = useEffectEvent(() => {
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);

    if (dataFraBackend && kvitteringDokument?.type?.type) {
      setSelvbestemtType(kvitteringDokument.type.type);
    }
  });

  useEffect(() => {
    onsetSkjemaStatus();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Kvittering for innsendt inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />

      <PageContent title='Kvittering - innsendt inntektsmelding'>
        <div className={`main-content ${styles.padded}`}>
          <div className='page-kvittering-header'>
            <Heading2>Kvittering - innsendt inntektsmelding</Heading2>
            <div className='page-content-header-extra'>
              <ButtonEndre onClick={clickEndre} />
            </div>
          </div>

          <PersonVisning {...personData} />
          <Skillelinje />
          <div className={classNameWrapperFravaer}>
            {visArbeidsgiverperiode && (
              <Fravaersperiode
                sykmeldingsperioder={sykmeldingsperioder}
                paakrevdeOpplysninger={paakrevdeOpplysninger}
              />
            )}

            <div className={classNameWrapperSkjaeringstidspunkt}>
              <div className={lokalStyling.ytterstefravaerwrapper}>
                <div className={lokalStyling.ytrefravaerswrapper}>
                  <Heading2 className={lokalStyling.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                  <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                  <div className={lokalStyling.fravaerwrapper}>
                    <div className={lokalStyling.fravaertid}>Dato</div>
                    <div data-cy='bestemmendefravaersdag'>{formatDate(visningBestemmendeFravaersdag)} </div>
                  </div>
                </div>
                {visArbeidsgiverperiode && (
                  <div className={lokalStyling.arbeidsgiverperiode}>
                    <Heading2 className={lokalStyling.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                    {!ingenArbeidsgiverperioder && (
                      <BodyLong>
                        Arbeidsgiver er ansvarlig for å betale ut lønn til den sykmeldte under arbeidsgiverpeioden.
                        Deretter betaler Nav lønn til den syke eller refunderer bedriften.
                      </BodyLong>
                    )}
                    {ingenArbeidsgiverperioder && <BodyLong>Det er ikke arbeidsgiverperiode.</BodyLong>}
                    {arbeidsgiverperioder?.map((periode) => (
                      <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Skillelinje />
          <Heading2>Beregnet månedslønn</Heading2>
          <BodyShort className={lokalStyling.uthevet}>Registrert inntekt</BodyShort>
          <BodyShort>{formatCurrency(inntekt.beloep)} kr/måned</BodyShort>

          {inntekt.endringAarsaker.map((endring, endringIndex) => (
            <Fragment key={endring?.aarsak + endringIndex}>
              <div className={lokalStyling.uthevet}>Endret med årsak</div>

              {formatBegrunnelseEndringBruttoinntekt(endring?.aarsak)}
              <EndringAarsakVisning endringAarsak={endring} />
            </Fragment>
          ))}
          <FaisuKvittering arbeidsforhold={kvitteringData?.flereArbeidsforhold} />
          <Skillelinje />
          <Heading2>Refusjon</Heading2>
          {visFullLonnIArbeidsgiverperioden && (
            <>
              <div className={lokalStyling.uthevet}>
                Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
              </div>
              <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLoennIArbeidsgiverPerioden} />
            </>
          )}
          <LonnUnderSykefravaeret
            loenn={loenn}
            harRefusjonEndringer={harGyldigeRefusjonEndringer(refusjonEndringer) ? 'Ja' : 'Nei'}
            refusjonEndringer={refusjonEndringer}
          />
          {visNaturalytelser && (
            <>
              <Skillelinje />
              <Heading2>Eventuelle naturalytelser</Heading2>
              <BortfallNaturalytelser ytelser={visningNaturalytelser} />
            </>
          )}
          <Skillelinje />

          <BodyShort>Inntektsmelding innsendt{innsendingTidspunkt}</BodyShort>
          <HStack justify='space-between' className={lokalStyling.buttonWrapper + ' skjul-fra-print'}>
            <HStack gap='space-64'>
              <ButtonEndre onClick={clickEndre} />
              <Button variant='tertiary' as='a' href={environment.saksoversiktUrl}>
                Lukk
              </Button>
            </HStack>
            <ButtonPrint className={lokalStyling.skrivutknapp}>Skriv ut</ButtonPrint>
          </HStack>
        </div>
        <KvitteringFeil kvitteringStatus={kvitteringStatus} />
      </PageContent>
    </div>
  );
};

export default Kvittering;

type KvitteringNavNoSchema = z.infer<typeof KvitteringNavNoSchema>;

function prepareForInitiering(
  kvitteringData: KvitteringInitData,
  personData: PersonData,
  mottatt: Date | undefined
): KvitteringNavNoSchema {
  if (!mottatt || !isValid(mottatt)) {
    throw new Error('Kan ikke initialisere kvitteringen uten gyldig mottaksdato');
  }

  const kvittering: KvitteringNavNoSchema = {
    sykmeldt: { navn: personData.navn, fnr: personData.identitetsnummer },
    avsender: {
      orgnr: personData.orgnrUnderenhet,
      orgNavn: personData.virksomhetNavn,
      navn: personData.innsenderNavn,
      tlf: personData.innsenderTelefonNr
    },
    sykmeldingsperioder: kvitteringData.sykmeldingsperioder ?? [],
    skjema: {
      agp: kvitteringData.agp ?? null,
      inntekt: { ...kvitteringData.inntekt },
      refusjon: kvitteringData.refusjon
        ? {
            beloepPerMaaned: kvitteringData.refusjon.beloepPerMaaned,
            endringer: kvitteringData.refusjon.endringer ? [...kvitteringData.refusjon.endringer] : undefined
          }
        : null,
      naturalytelser: kvitteringData.naturalytelser ?? null
    },
    mottatt: mottatt.toISOString()
  };

  return kvittering;
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ kvittid: string }>) {
  const result = await getKvitteringServerSideProps<SelvbestemtKvitteringResponse>({
    context,
    fetchKvittering: hentKvitteringsdataAgiSSR,
    checkDataFraBackend: (data, fromSubmit) => !fromSubmit && !!data?.success?.selvbestemtInntektsmelding,
    errorLogMessage: 'Error fetching selvbestemt kvittering:'
  });

  if ('redirect' in result) {
    return { redirect: result.redirect };
  }
  if ('notFound' in result) {
    return { notFound: true as const };
  }

  return {
    props: {
      ...result.props,
      kvittering: result.props.kvittering?.success?.selvbestemtInntektsmelding ?? null
    }
  };
}
