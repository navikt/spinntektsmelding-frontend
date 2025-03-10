import testdata from '../../../mockdata/selvbestemt-kvittering.json';
import { Fragment } from 'react';
import { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../../components/PageContent/PageContent';

import lokalStyles from '../Kvittering.module.css';
import styles from '../../../styles/Home.module.css';

import Heading2 from '../../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Skeleton } from '@navikt/ds-react';

import Skillelinje from '../../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../../utils/formatCurrency';
import { useRouter, useSearchParams } from 'next/navigation';
import BortfallNaturalytelser from '../../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../../state/useBoundStore';

import ButtonPrint from '../../../components/ButtonPrint';

import ButtonEndre from '../../../components/ButtonEndre';
import formatDate from '../../../utils/formatDate';
import { useEffect } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../../utils/formatBegrunnelseEndringBruttoinntekt';
import formatTime from '../../../utils/formatTime';
import EndringAarsakVisning from '../../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isBefore, isEqual, isValid } from 'date-fns';
import { LonnISykefravaeret, Periode, RefusjonskravetOpphoerer, YesNo } from '../../../state/state';

import KvitteringAnnetSystem from '../../../components/KvitteringAnnetSystem';
import isValidUUID from '../../../utils/isValidUUID';
import Fravaersperiode from '../../../components/kvittering/Fravaersperiode';
import classNames from 'classnames/bind';
import { harGyldigeRefusjonEndringer } from '../../../utils/harGyldigeRefusjonEndringer';
import hentKvitteringsdataSSR from '../../../utils/hentKvitteringsdataSSR';
import parseIsoDate from '../../../utils/parseIsoDate';
import PersonVisning from '../../../components/PersonVisning/PersonVisning';
import { MottattPeriode } from '../../../state/MottattData';
import useKvitteringInit from '../../../state/useKvitteringInit';

import { SkjemaStatus } from '../../../state/useSkjemadataStore';
import { getToken, validateToken } from '@navikt/oasis';
import environment from '../../../config/environment';
import { z } from 'zod';
import { kvitteringNavNoSchema } from '../../../schema/mottattKvitteringSchema';

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
  const searchParams = useSearchParams();

  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const kvitteringData = useBoundStore((state) => state.kvitteringData);

  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const lagretEndringsaarsaker = useBoundStore((state) => state.endringsaarsaker);

  const [navn, virksomhetsnavn, innsenderNavn] = useBoundStore((state) => [
    state.navn,
    state.virksomhetsnavn,
    state.innsenderNavn
  ]);

  const kvitteringEksterntSystem = kvittering?.kvitteringEkstern;
  const kvitteringSlug = kvittid || searchParams.get('kvittid');

  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);

  const kvitteringInit = useKvitteringInit();
  console.log('kvittering', kvittering);
  const kvitteringDokument = kvittering?.selvbestemtInntektsmelding
    ? kvittering?.selvbestemtInntektsmelding
    : kvitteringData;

  const kvitteringInnsendt = new Date(kvitteringDokument?.tidspunkt);
  const bestemmendeFravaersdag = dataFraBackend
    ? kvitteringDokument?.inntekt.inntektsdato
    : kvitteringData?.inntekt?.inntektsdato;
  const arbeidsgiverperioder = dataFraBackend ? kvitteringDokument?.agp?.perioder : kvitteringData?.agp?.perioder;

  const personData: PersonData = dataFraBackend
    ? {
        navn: kvitteringDokument.sykmeldt.navn,
        identitetsnummer: kvitteringDokument.sykmeldt.fnr,
        orgnrUnderenhet: kvitteringDokument.avsender.orgnr,
        virksomhetNavn: kvitteringDokument.avsender.orgNavn,
        innsenderNavn: kvitteringDokument.avsender.navn,
        innsenderTelefonNr: kvitteringDokument.avsender.tlf
      }
    : {
        navn: navn,
        identitetsnummer: kvitteringData?.sykmeldtFnr,
        orgnrUnderenhet: kvitteringData?.avsender.orgnr,
        virksomhetNavn: virksomhetsnavn,
        innsenderNavn: innsenderNavn,
        innsenderTelefonNr: kvitteringData?.avsender.tlf
      };

  const clickEndre = () => {
    const input = dataFraBackend ? kvitteringDokument : kvitteringData;

    // Må lagre data som kan endres i hovedskjema - Start
    const kvittering = prepareForInitiering(input);
    kvitteringInit({ kvitteringNavNo: kvittering });
    // Må lagre data som kan endres i hovedskjema - Slutt

    if (isValidUUID(kvitteringSlug)) {
      router.push(`/${kvitteringSlug}`);
    }
  };

  let innsendingstidspunkt =
    kvitteringInnsendt && isValid(kvitteringInnsendt)
      ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
      : '';

  if (kvitteringEksterntSystem?.tidspunkt) {
    const tidspunkt = new Date(kvitteringEksterntSystem.tidspunkt);
    innsendingstidspunkt =
      tidspunkt && isValid(tidspunkt) ? ` - ${formatDate(tidspunkt)} kl. ${formatTime(tidspunkt)}` : '';
  }
  const ingenArbeidsgiverperioder = arbeidsgiverperioder && arbeidsgiverperioder.length === 0;

  const paakrevdeOpplysninger = ['arbeidsgiverperiode', 'naturalytelser', 'refusjon'];

  const visningBestemmendeFravaersdag = dataFraBackend
    ? parseIsoDate(kvitteringDokument.inntekt.inntektsdato)
    : parseIsoDate(kvitteringData?.inntekt?.inntektsdato);

  useEffect(() => {
    setNyInnsending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const visNaturalytelser = true;
  const visArbeidsgiverperiode = true;
  const visFullLonnIArbeidsgiverperioden = true;
  const inntekt = dataFraBackend
    ? { ...kvitteringDokument.inntekt, beregnetInntekt: kvitteringDokument.inntekt.beloep }
    : {
        beregnetInntekt: kvitteringData?.inntekt?.beloep
      };

  let fravaersperioder: Periode[] = [];
  let egenmeldingsperioder: Periode[] = [];
  if (dataFraBackend) {
    fravaersperioder = kvitteringDokument.sykmeldingsperioder?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));

    egenmeldingsperioder = kvitteringDokument.agp.egenmeldinger?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));
  } else {
    fravaersperioder = kvitteringData.sykmeldingsperioder?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));

    egenmeldingsperioder = kvitteringData.agp.egenmeldinger?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));
  }

  const cx = classNames.bind(lokalStyles);
  const classNameWrapperFravaer = cx({
    fravaerswrapperwrapper: visArbeidsgiverperiode
  });

  const classNameWrapperSkjaeringstidspunkt = cx({
    infoboks: visArbeidsgiverperiode
  });

  let fullLoennIArbeidsgiverPerioden;

  if (dataFraBackend) {
    fullLoennIArbeidsgiverPerioden = { status: '', utbetalt: 0, begrunnelse: '' };
    fullLoennIArbeidsgiverPerioden.status = kvitteringDokument?.agp?.redusertLoennIAgp ? 'Nei' : 'Ja';
    fullLoennIArbeidsgiverPerioden.utbetalt = kvitteringDokument?.agp?.redusertLoennIAgp?.beloep;
    fullLoennIArbeidsgiverPerioden.begrunnelse = kvitteringDokument?.agp.redusertLoennIAgp?.begrunnelse;
    if (kvitteringDokument?.vedtaksperiodeId) {
      setVedtaksperiodeId(kvitteringDokument?.vedtaksperiodeId);
    }
  } else {
    fullLoennIArbeidsgiverPerioden = { status: '', utbetalt: 0, begrunnelse: '' };
    fullLoennIArbeidsgiverPerioden.status = kvitteringData?.agp?.redusertLoennIAgp ? 'Nei' : 'Ja';
    fullLoennIArbeidsgiverPerioden.utbetalt = kvitteringData?.agp?.redusertLoennIAgp?.beloep;
    fullLoennIArbeidsgiverPerioden.begrunnelse = kvitteringData?.agp?.redusertLoennIAgp?.begrunnelse;
  }

  let loenn: LonnISykefravaeret;
  if (dataFraBackend) {
    loenn = {
      status: kvitteringDokument.refusjon ? 'Ja' : 'Nei',
      beloep: kvitteringDokument.refusjon?.beloepPerMaaned
    };
  } else {
    loenn = {
      status: kvitteringData?.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei',
      beloep: kvitteringData?.refusjon?.beloepPerMaaned
    };
  }

  let refusjonskravetOpphoerer: RefusjonskravetOpphoerer;

  if (dataFraBackend) {
    refusjonskravetOpphoerer = {
      status: kvitteringDokument?.refusjon?.sluttdato ? 'Ja' : ('Nei' as YesNo),
      opphoersdato: parseIsoDate(kvitteringDokument.refusjon?.sluttdato)
    };
  } else {
    refusjonskravetOpphoerer = {
      status: kvitteringData?.refusjon?.sluttdato ? 'Ja' : 'Nei',
      opphoersdato: kvitteringData?.refusjon?.sluttdato ? parseIsoDate(kvitteringData?.refusjon?.sluttdato) : undefined
    };
  }

  let refusjonEndringer = [];
  if (dataFraBackend) {
    refusjonEndringer = kvitteringDokument?.refusjon?.endringer?.map((endring) => ({
      dato: parseIsoDate(endring.startdato),
      beloep: endring.beloep
    }));
  } else {
    refusjonEndringer = kvitteringData?.refusjon?.endringer
      ? kvitteringData?.refusjon?.endringer.map((endring) => ({
          dato: parseIsoDate(endring.startdato),
          beloep: endring.beloep
        }))
      : [];
  }
  let refusjonEndringerUtenSkjaeringstidspunkt = [];
  if (dataFraBackend) {
    refusjonEndringerUtenSkjaeringstidspunkt = refusjonEndringer?.filter((endring) => {
      return (
        !endring.dato ||
        !bestemmendeFravaersdag ||
        !gammeltSkjaeringstidspunkt ||
        (!isEqual(endring.dato, bestemmendeFravaersdag) && !isEqual(endring.dato, gammeltSkjaeringstidspunkt))
      );
    });
  } else {
    refusjonEndringerUtenSkjaeringstidspunkt =
      gammeltSkjaeringstidspunkt && refusjonEndringer
        ? refusjonEndringer
            ?.filter((endring) => {
              if (!endring.dato) return false;
              return !isBefore(endring.dato, gammeltSkjaeringstidspunkt);
            })
            .map((endring) => {
              return {
                beloep: endring.beloep ?? endring.beloep,
                dato: endring.dato
              };
            })
        : refusjonEndringer;
  }

  const endringAarsak = dataFraBackend
    ? kvitteringDokument.inntekt.endringAarsak
    : kvitteringData?.inntekt.endringAarsak;

  const endringsaarsaker = dataFraBackend
    ? kvitteringDokument.inntekt.endringsaarsaker
    : (kvitteringData?.inntekt?.endringsaarsaker ?? lagretEndringsaarsaker);

  useEffect(() => {
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {kvitteringEksterntSystem?.avsenderSystem && (
            <KvitteringAnnetSystem
              arkivreferanse={kvitteringEksterntSystem.referanse}
              eksterntSystem={kvitteringEksterntSystem.avsenderSystem}
              mottattDato={innsendingstidspunkt}
              kvitteringId={kvittid}
            />
          )}
          {!kvitteringEksterntSystem?.avsenderSystem && (
            <>
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
                    fravaersperioder={fravaersperioder}
                    egenmeldingsperioder={egenmeldingsperioder}
                    paakrevdeOpplysninger={paakrevdeOpplysninger}
                  />
                )}

                <div className={classNameWrapperSkjaeringstidspunkt}>
                  <div className={lokalStyles.ytterstefravaerwrapper}>
                    <div className={lokalStyles.ytrefravaerswrapper}>
                      <Heading2 className={lokalStyles.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                      <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                      <div className={lokalStyles.fravaerwrapper}>
                        <div className={lokalStyles.fravaertid}>Dato</div>
                        <div data-cy='bestemmendefravaersdag'>
                          {visningBestemmendeFravaersdag ? (
                            formatDate(visningBestemmendeFravaersdag)
                          ) : (
                            <Skeleton variant='text' />
                          )}{' '}
                        </div>
                      </div>
                    </div>
                    {visArbeidsgiverperiode && (
                      <div className={lokalStyles.arbeidsgiverperiode}>
                        <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                        {!ingenArbeidsgiverperioder && (
                          <BodyLong>
                            Arbeidsgiver er ansvarlig for å betale ut lønn til den sykmeldte under arbeidsgiverpeioden.
                            Deretter betaler Nav lønn til den syke eller refunderer bedriften.
                          </BodyLong>
                        )}
                        {ingenArbeidsgiverperioder && <BodyLong>Det er ikke arbeidsgiverperiode.</BodyLong>}
                        {arbeidsgiverperioder?.map((periode) => (
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
              <BodyShort className={lokalStyles.uthevet}>Registrert inntekt</BodyShort>
              <BodyShort>{formatCurrency(inntekt.beregnetInntekt)} kr/måned</BodyShort>
              {endringAarsak && (
                <>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(endringAarsak.aarsak as string)}
                  <EndringAarsakVisning
                    aarsak={endringAarsak.aarsak}
                    gjelderFra={endringAarsak.gjelderFra}
                    bleKjent={endringAarsak.bleKjent}
                    perioder={endringAarsak.perioder}
                  />
                </>
              )}
              {endringsaarsaker?.map((endring, endringIndex) => (
                <Fragment key={endringIndex}>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(endring.aarsak as string)}
                  <EndringAarsakVisning endringAarsak={endring} />
                </Fragment>
              ))}
              <Skillelinje />
              <Heading2>Refusjon</Heading2>
              {visFullLonnIArbeidsgiverperioden && (
                <>
                  <div className={lokalStyles.uthevet}>
                    Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
                  </div>
                  <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLoennIArbeidsgiverPerioden} />
                </>
              )}
              <LonnUnderSykefravaeret
                loenn={loenn}
                refusjonskravetOpphoerer={refusjonskravetOpphoerer}
                harRefusjonEndringer={
                  harGyldigeRefusjonEndringer(refusjonEndringerUtenSkjaeringstidspunkt) ? 'Ja' : 'Nei'
                }
                refusjonEndringer={refusjonEndringerUtenSkjaeringstidspunkt}
              />
              {visNaturalytelser && (
                <>
                  <Skillelinje />
                  <Heading2>Eventuelle naturalytelser</Heading2>
                  <BortfallNaturalytelser ytelser={naturalytelser!} />
                </>
              )}
              <Skillelinje />
            </>
          )}
          <BodyShort>Kvittering - innsendt inntektsmelding{innsendingstidspunkt}</BodyShort>
          <div className={lokalStyles.buttonWrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              {!kvitteringEksterntSystem?.avsenderSystem && <ButtonEndre onClick={clickEndre} />}
              <Link className={lokalStyles.lukkelenke} href={environment.saksoversiktUrl}>
                Lukk
              </Link>
            </div>
            <ButtonPrint className={lokalStyles.skrivutknapp}>Skriv ut</ButtonPrint>
          </div>
        </div>
      </PageContent>
    </div>
  );
};

export default Kvittering;

type KvitteringNavNoSchema = z.infer<typeof kvitteringNavNoSchema>;

function prepareForInitiering(kvitteringData: any): KvitteringNavNoSchema {
  const kvittering: KvitteringNavNoSchema = {
    sykmeldt: kvitteringData.sykmeldt,
    avsender: kvitteringData.avsender,
    sykmeldingsperioder: kvitteringData.sykmeldingsperioder ?? [],
    skjema: {
      agp: kvitteringData.agp ?? null,
      inntekt: { ...kvitteringData.inntekt },
      refusjon: kvitteringData.refusjon ?? null
    },
    mottatt: kvitteringData.tidspunkt
  };

  return kvittering;
}

export async function getServerSideProps(context: any) {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    return {
      props: {
        kvittid: context.query.kvittid,
        kvittering: {},
        kvitteringStatus: 404,
        dataFraBackend: false
      }
    };
  }
  const kvittid = context.query.kvittid;

  let kvittering: { status: number; data: { success: any } };

  const token = getToken(context.req);
  if (!token) {
    /* håndter manglende token */
    console.error('Mangler token i header');
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    /* håndter valideringsfeil */
    console.error('Valideringsfeil');
    const ingress = context.req.headers.host + environment.baseUrl;
    const currentPath = `https://${ingress}${context.resolvedUrl}`;

    const destination = `https://${ingress}/oauth2/login?redirect=${currentPath}`;
    return {
      redirect: {
        destination: destination,
        permanent: false
      }
    };
  }

  try {
    kvittering = await hentKvitteringsdataSSR(kvittid, token);
    kvittering!.status = 200;
  } catch (error: any) {
    console.error('Error fetching selvbestemt kvittering:', error);
    kvittering = { data: { success: null }, status: error.status };

    if (error.status === 404) {
      return {
        notFound: true
      };
    }
  }

  return {
    props: {
      kvittid,
      kvittering: kvittering?.data?.success,
      kvitteringStatus: kvittering?.status,
      dataFraBackend: !!kvittering?.data?.success?.selvbestemtInntektsmelding
    }
  };
}
