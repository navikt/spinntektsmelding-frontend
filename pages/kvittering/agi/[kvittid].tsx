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
import formatTime from '../../../utils/formatTime';
import EndringAarsakVisning from '../../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isEqual, isValid } from 'date-fns';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, Periode } from '../../../state/state';

import isValidUUID from '../../../utils/isValidUUID';
import Fravaersperiode from '../../../components/kvittering/Fravaersperiode';
import { harGyldigeRefusjonEndringer } from '../../../utils/harGyldigeRefusjonEndringer';
import hentKvitteringsdataAgiSSR from '../../../utils/hentKvitteringsdataAgiSSR';
import parseIsoDate from '../../../utils/parseIsoDate';
import PersonVisning from '../../../components/PersonVisning/PersonVisning';
import { MottattPeriode } from '../../../schema/ForespurtDataSchema';
import useKvitteringInit from '../../../state/useKvitteringInit';

import { SkjemaStatus } from '../../../state/useSkjemadataStore';
import environment from '../../../config/environment';
import { getKvitteringServerSideProps } from '../../../utils/getKvitteringServerSideProps';
import { z } from 'zod';
import { KvitteringNavNoSchema } from '../../../schema/MottattKvitteringSchema';
import { EndringAarsak } from '../../../validators/validerAapenInnsending';
import useRefusjonEndringerUtenSkjaeringstidspunkt from '../../../utils/useRefusjonEndringerUtenSkjaeringstidspunkt';
import { PeriodeSchema } from '../../../schema/KonverterPeriodeSchema';
import { useShallow } from 'zustand/react/shallow';
import { ApiNaturalytelserSchema } from '../../../schema/ApiNaturalytelserSchema';
import NaturalytelserSchema from '../../../schema/NaturalytelserSchema';
import { RefusjonEndringSchema } from '../../../schema/RefusjonEndringSchema';
import HentingAvDataFeilet from '../../../components/HentingAvDataFeilet';
import FaisuKvittering from '../../../components/FaisuKvittering/FaisuKvittering';
import FullInnsendingSchema from '../../../schema/FullInnsendingSchema';
import AapenInnsendingSchema from '../../../schema/AapenInnsendingSchema';
import { SelvbestemtInntektsmeldingSchema, SelvbestemtKvittering } from '../../../schema/SelvbestemtKvitteringSchema';

type EndringsBeloep = z.infer<typeof RefusjonEndringSchema>;
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

function mapPerioderTilInterntFormat(perioder: z.infer<typeof PeriodeSchema>[]): Periode[] {
  if (!perioder || perioder.length === 0) return [];

  return perioder.map((periode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: periode.fom + periode.tom
  }));
}

function mapNaturalytelserTilInterntFormat(
  naturalytelser: z.infer<typeof ApiNaturalytelserSchema> | undefined
): z.infer<typeof NaturalytelserSchema>[] {
  if (!naturalytelser || naturalytelser.length === 0) return [];
  return naturalytelser.map((ytelse: z.infer<typeof ApiNaturalytelserSchema>[number]) => ({
    naturalytelse: ytelse.naturalytelse,
    sluttdato: parseIsoDate(ytelse.sluttdato)!,
    verdiBeloep: ytelse.verdiBeloep
  }));
}

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
    gammeltSkjaeringstidspunkt,
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
      state.gammeltSkjaeringstidspunkt,
      state.setArbeidsgiverperiodeDisabled
    ])
  );
  const kvitteringInit = useKvitteringInit();

  const kvitteringDokument = kvittering ?? kvitteringData;

  const visningdata = dataFraBackend
    ? {
        personData: {
          navn: kvitteringDokument.sykmeldt.navn,
          identitetsnummer: kvitteringDokument.sykmeldt.fnr,
          orgnrUnderenhet: kvitteringDokument.avsender.orgnr,
          virksomhetNavn: kvitteringDokument.avsender.orgNavn,
          innsenderNavn: kvitteringDokument.avsender.navn,
          innsenderTelefonNr: kvitteringDokument.avsender.tlf
        },
        bestemmendeFravaersdag: kvitteringDokument.inntekt.inntektsdato,
        arbeidsgiverperioder: kvitteringDokument.agp?.perioder,
        sykmeldingsperioder: kvitteringDokument.sykmeldingsperioder,
        beregnetInntekt: kvitteringDokument.inntekt.beloep,
        endringAarsaker: kvitteringDokument.inntekt.endringAarsaker,
        redusertLoennIAgp: kvitteringDokument.agp?.redusertLoennIAgp,
        naturalytelser: kvitteringDokument.naturalytelser,
        refusjon: kvitteringDokument.refusjon,
        harRefusjon: Boolean(kvitteringDokument.refusjon)
      }
    : {
        personData: {
          navn: sykmeldt.navn,
          identitetsnummer: sykmeldt.fnr,
          orgnrUnderenhet: avsender.orgnr,
          virksomhetNavn: avsender.orgNavn,
          innsenderNavn: avsender.navn,
          innsenderTelefonNr: avsender.tlf
        },
        bestemmendeFravaersdag: kvitteringData?.inntekt?.inntektsdato,
        arbeidsgiverperioder: kvitteringData?.agp?.perioder,
        sykmeldingsperioder: kvitteringData?.sykmeldingsperioder,
        beregnetInntekt: kvitteringData?.inntekt?.beloep,
        endringAarsaker: kvitteringData?.inntekt?.endringAarsaker ?? lagretEndringAarsaker,
        redusertLoennIAgp: kvitteringData?.agp?.redusertLoennIAgp,
        naturalytelser: kvitteringData?.naturalytelser,
        refusjon: kvitteringData?.refusjon,
        harRefusjon: Boolean(kvitteringData?.refusjon?.beloepPerMaaned)
      };

  if (dataFraBackend && kvitteringDokument?.vedtaksperiodeId) {
    setVedtaksperiodeId(kvitteringDokument.vedtaksperiodeId);
  }

  const kvitteringInnsendt = new Date(kvitteringDokument?.tidspunkt);
  const { personData, arbeidsgiverperioder } = visningdata;
  const ingenArbeidsgiverperioder = arbeidsgiverperioder?.length === 0;
  const bestemmendeFravaersdag = visningdata.bestemmendeFravaersdag;
  console.log('kvitteringDokument:', kvitteringDokument);

  const clickEndre = async () => {
    const input = dataFraBackend ? kvitteringDokument : kvitteringData;
    // Må lagre data som kan endres i hovedskjema - Start
    const kvittering = prepareForInitiering(input, personData);
    kvitteringInit({ kvitteringNavNo: kvittering, kvitteringEkstern: null });
    // Må lagre data som kan endres i hovedskjema - Slutt
    if (ingenArbeidsgiverperioder) {
      setArbeidsgiverperiodeDisabled(true);
    }
    if (input?.agp?.perioder) {
      setBehandlingsdager(input.agp.perioder.map((periode: MottattPeriode) => periode.fom));
    }

    if (isValidUUID(kvittid)) {
      await router.push(`/${kvittid}?endre=true&agi=true`);
    }
  };

  const innsendingTidspunkt =
    kvitteringInnsendt && isValid(kvitteringInnsendt)
      ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
      : '';

  const paakrevdeOpplysninger = ['arbeidsgiverperiode', 'naturalytelser', 'refusjon'];

  const visningBestemmendeFravaersdag = parseIsoDate(visningdata.bestemmendeFravaersdag);

  const onSetNyInnsending = useEffectEvent(() => {
    setNyInnsending(false);
  });

  useEffect(() => {
    onSetNyInnsending();
  }, [router.asPath]);

  const visNaturalytelser = true;
  const visArbeidsgiverperiode = true;
  const visFullLonnIArbeidsgiverperioden = true;
  const inntekt = { beregnetInntekt: visningdata.beregnetInntekt };
  const sykmeldingsperioder = mapPerioderTilInterntFormat(visningdata.sykmeldingsperioder ?? []);

  const classNameWrapperFravaer = visArbeidsgiverperiode ? lokalStyling.fravaerswrapperwrapper : '';
  const classNameWrapperSkjaeringstidspunkt = visArbeidsgiverperiode ? lokalStyling.infoboks : '';

  const fullLoennIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
    status: visningdata.redusertLoennIAgp ? 'Nei' : 'Ja',
    utbetalt: visningdata.redusertLoennIAgp?.beloep,
    begrunnelse: visningdata.redusertLoennIAgp?.begrunnelse
  };
  const visningNaturalytelser = mapNaturalytelserTilInterntFormat(visningdata.naturalytelser);
  const loenn: LonnISykefravaeret = {
    status: visningdata.harRefusjon ? 'Ja' : 'Nei',
    beloep: visningdata.refusjon?.beloepPerMaaned
  };
  const refusjonEndringer: EndringsBeloep[] = [
    ...(visningdata.refusjon?.endringer ?? []).map((endring: z.infer<typeof RefusjonEndringSchema>) => ({
      startdato: parseIsoDate(endring.startdato),
      beloep: endring.beloep
    })),
    ...(visningdata.refusjon?.sluttdato
      ? [{ beloep: 0, startdato: parseIsoDate(visningdata.refusjon.sluttdato)! }]
      : [])
  ];
  const innsendtRefusjonEndringerUtenSkjaeringstidspunkt = useRefusjonEndringerUtenSkjaeringstidspunkt();
  const refusjonEndringerUtenSkjaeringstidspunkt = dataFraBackend
    ? refusjonEndringer.filter(
        (endring) =>
          !endring.startdato ||
          !bestemmendeFravaersdag ||
          !gammeltSkjaeringstidspunkt ||
          (!isEqual(endring.startdato, bestemmendeFravaersdag) &&
            !isEqual(endring.startdato, gammeltSkjaeringstidspunkt))
      )
    : innsendtRefusjonEndringerUtenSkjaeringstidspunkt;
  const visningEndringAarsaker = visningdata.endringAarsaker;

  const onsetSkjemaStatus = useEffectEvent(() => {
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);

    if (dataFraBackend && kvitteringDokument?.type?.type) {
      setSelvbestemtType(kvitteringDokument?.type?.type);
    }
  });

  useEffect(() => {
    onsetSkjemaStatus();
  }, []);

  const lukkHentingFeiletModal = () => {
    if (environment.saksoversiktUrl !== undefined && globalThis.window?.location !== undefined) {
      globalThis.window.location.href = environment.saksoversiktUrl;
    }
  };

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
                    {arbeidsgiverperioder?.map((periode: z.infer<typeof PeriodeSchema>) => (
                      <PeriodeFraTil
                        fom={parseIsoDate(periode.fom)}
                        tom={parseIsoDate(periode.tom)}
                        key={periode.fom + periode.tom}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Skillelinje />
          <Heading2>Beregnet månedslønn</Heading2>
          <BodyShort className={lokalStyling.uthevet}>Registrert inntekt</BodyShort>
          <BodyShort>{formatCurrency(inntekt.beregnetInntekt)} kr/måned</BodyShort>

          {visningEndringAarsaker?.map((endring: EndringAarsak, endringIndex: number) => (
            <Fragment key={endring?.aarsak + endringIndex}>
              <div className={lokalStyling.uthevet}>Endret med årsak</div>

              {formatBegrunnelseEndringBruttoinntekt(endring?.aarsak as string)}
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
            harRefusjonEndringer={harGyldigeRefusjonEndringer(refusjonEndringerUtenSkjaeringstidspunkt) ? 'Ja' : 'Nei'}
            refusjonEndringer={refusjonEndringerUtenSkjaeringstidspunkt}
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
        <HentingAvDataFeilet
          open={kvitteringStatus === 500}
          handleCloseModal={lukkHentingFeiletModal}
          title='Henting av kvitteringen feilet'
          ariaLabel='Henting av kvittering feilet'
        />
      </PageContent>
    </div>
  );
};

export default Kvittering;

type KvitteringNavNoSchema = z.infer<typeof KvitteringNavNoSchema>;

function prepareForInitiering(kvitteringData: KvitteringInitData, personData: PersonData): KvitteringNavNoSchema {
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
            ...kvitteringData.refusjon,
            endringer: kvitteringData.refusjon.endringer ? [...kvitteringData.refusjon.endringer] : undefined
          }
        : null,
      naturalytelser: kvitteringData.naturalytelser ?? null
    },
    mottatt: kvitteringData.tidspunkt
  };

  return kvittering;
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ kvittid: string }>) {
  const result = await getKvitteringServerSideProps<SelvbestemtKvittering>({
    context,
    fetchKvittering: hentKvitteringsdataAgiSSR,
    checkDataFraBackend: (data, fromSubmit) => !fromSubmit && !!data?.success?.selvbestemtInntektsmelding,
    errorLogMessage: 'Error fetching selvbestemt kvittering:'
  });

  const props = { ...result.props, kvittering: result.props?.kvittering?.success?.selvbestemtInntektsmelding ?? null };

  return { ...result, props };
}
