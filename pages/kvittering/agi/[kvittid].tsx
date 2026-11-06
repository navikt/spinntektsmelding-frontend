import { useEffect, useEffectEvent } from 'react';
import { InferGetServerSidePropsType, NextPage, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../../components/PageContent/PageContent';

import styles from '../../../styles/Home.module.css';

import Skillelinje from '../../../components/Skillelinje/Skillelinje';
import { useRouter } from 'next/router';

import useBoundStore from '../../../state/useBoundStore';

import { isValid } from 'date-fns';

import isValidUUID from '../../../utils/isValidUUID';
import hentKvitteringsdataAgiSSR, { SelvbestemtKvitteringResponse } from '../../../utils/hentKvitteringsdataAgiSSR';
import PersonVisning from '../../../components/PersonVisning/PersonVisning';
import { MottattPeriode } from '../../../schema/ForespurtDataSchema';
import useKvitteringInit from '../../../state/useKvitteringInit';

import { SkjemaStatus, SkjemadataState } from '../../../state/useSkjemadataStore';
import environment from '../../../config/environment';
import { getKvitteringServerSideProps } from '../../../utils/getKvitteringServerSideProps';
import { z } from 'zod';
import { KvitteringNavNoSchema } from '../../../schema/MottattKvitteringSchema';
import { lagKvitteringVisning } from '../../../utils/lagKvitteringVisning';
import { useShallow } from 'zustand/react/shallow';
import KvitteringFeil from '../../../components/kvittering/KvitteringFeil';
import KvitteringHeader from '../../../components/kvittering/KvitteringHeader';
import KvitteringFravaer from '../../../components/kvittering/KvitteringFravaer';
import KvitteringInntekt from '../../../components/kvittering/KvitteringInntekt';
import KvitteringRefusjon from '../../../components/kvittering/KvitteringRefusjon';
import KvitteringNaturalytelser from '../../../components/kvittering/KvitteringNaturalytelser';
import KvitteringFooter from '../../../components/kvittering/KvitteringFooter';
import FaisuKvittering from '../../../components/FaisuKvittering/FaisuKvittering';
import { SelvbestemtInntektsmeldingSchema } from '../../../schema/SelvbestemtKvitteringSchema';
import { Periode } from '../../../state/state';
import formatIsoDate from '../../../utils/formatIsoDate';

type KvitteringInitData =
  NonNullable<SkjemadataState['kvitteringData']> | z.infer<typeof SelvbestemtInntektsmeldingSchema>;

type PersonData = {
  navn: string | undefined;
  identitetsnummer: string | undefined;
  orgnrUnderenhet: string | undefined;
  virksomhetNavn: string | undefined;
  innsenderNavn: string | undefined;
  innsenderTelefonNr: string | undefined;
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
  const lagredeSykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const lagredeEgenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

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
    refusjon,
    mottatt,
    innsendingTidspunkt
  } = lagKvitteringVisning({
    sykmeldingsperioder:
      visningskilde && 'sykmeldingsperioder' in visningskilde
        ? visningskilde.sykmeldingsperioder
        : lagredeSykmeldingsperioder,
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
  const flereArbeidsforhold =
    kvitteringData && 'flereArbeidsforhold' in kvitteringData
      ? (kvitteringData.flereArbeidsforhold ?? undefined)
      : undefined;

  const clickEndre = async () => {
    const input = visningskilde;
    if (!input) {
      throw new Error('Kan ikke endre inntektsmeldingen uten kvitteringsdata');
    }
    // Må lagre data som kan endres i hovedskjema - Start
    const kvittering = prepareForInitiering(
      input,
      personData,
      mottatt,
      lagredeSykmeldingsperioder,
      lagredeEgenmeldingsperioder
    );
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
          <KvitteringHeader onEndre={clickEndre} />

          <PersonVisning {...personData} />
          <Skillelinje />
          <KvitteringFravaer
            sykmeldingsperioder={sykmeldingsperioder}
            arbeidsgiverperioder={arbeidsgiverperioder}
            bestemmendeFravaersdag={visningBestemmendeFravaersdag}
            paakrevdeOpplysninger={paakrevdeOpplysninger}
            visArbeidsgiverperiode={visArbeidsgiverperiode}
            visBestemmendeFravaersdag
            ingenArbeidsgiverperioder={ingenArbeidsgiverperioder}
          />
          <KvitteringInntekt inntekt={inntekt} />
          <FaisuKvittering arbeidsforhold={flereArbeidsforhold} />
          <KvitteringRefusjon
            refusjon={refusjon}
            fullLonnIArbeidsgiverperioden={
              visFullLonnIArbeidsgiverperioden ? fullLoennIArbeidsgiverPerioden : undefined
            }
          />
          {visNaturalytelser && (
            <KvitteringNaturalytelser tittel='Eventuelle naturalytelser' naturalytelser={visningNaturalytelser} />
          )}
          <Skillelinje />

          <KvitteringFooter
            innsendingTidspunkt={innsendingTidspunkt}
            saksoversiktUrl={environment.saksoversiktUrl}
            onEndre={clickEndre}
          />
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
  mottatt: Date | undefined,
  lagredeSykmeldingsperioder: Periode[] | undefined,
  lagredeEgenmeldingsperioder: Periode[] | undefined
): KvitteringNavNoSchema {
  if (!mottatt || !isValid(mottatt)) {
    throw new Error('Kan ikke initialisere kvitteringen uten gyldig mottaksdato');
  }
  if (!kvitteringData.inntekt) {
    throw new Error('Kan ikke initialisere AGI-kvitteringen uten inntektsdata');
  }

  const kvittering: KvitteringNavNoSchema = {
    sykmeldt: KvitteringNavNoSchema.shape.sykmeldt.parse({ navn: personData.navn, fnr: personData.identitetsnummer }),
    avsender: KvitteringNavNoSchema.shape.avsender.parse({
      orgnr: personData.orgnrUnderenhet,
      orgNavn: personData.virksomhetNavn,
      navn: personData.innsenderNavn,
      tlf: personData.innsenderTelefonNr
    }),
    sykmeldingsperioder:
      'sykmeldingsperioder' in kvitteringData
        ? kvitteringData.sykmeldingsperioder
        : tilApiPerioder(lagredeSykmeldingsperioder),
    skjema: {
      agp: kvitteringData.agp
        ? {
            ...kvitteringData.agp,
            egenmeldinger:
              'egenmeldinger' in kvitteringData.agp
                ? kvitteringData.agp.egenmeldinger
                : tilApiPerioder(lagredeEgenmeldingsperioder),
            redusertLoennIAgp: kvitteringData.agp.redusertLoennIAgp ?? null
          }
        : null,
      inntekt: {
        ...kvitteringData.inntekt,
        endringAarsaker:
          kvitteringData.inntekt.endringAarsaker ??
          ('endringAarsak' in kvitteringData.inntekt && kvitteringData.inntekt.endringAarsak
            ? [kvitteringData.inntekt.endringAarsak]
            : []),
        naturalytelser:
          'naturalytelser' in kvitteringData.inntekt
            ? kvitteringData.inntekt.naturalytelser
            : (kvitteringData.naturalytelser ?? [])
      },
      refusjon: kvitteringData.refusjon
        ? {
            beloepPerMaaned: kvitteringData.refusjon.beloepPerMaaned,
            endringer: [...(kvitteringData.refusjon.endringer ?? [])]
          }
        : null,
      naturalytelser: kvitteringData.naturalytelser ?? []
    },
    mottatt: mottatt.toISOString()
  };

  return kvittering;
}

function tilApiPerioder(perioder: Periode[] | undefined): MottattPeriode[] {
  return (perioder ?? []).flatMap((periode) => {
    const fom = formatIsoDate(periode.fom);
    const tom = formatIsoDate(periode.tom);
    return fom && tom ? [{ fom, tom }] : [];
  });
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
