import { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Skeleton } from '@navikt/ds-react';
import Person from '../../components/Person/Person';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter, useSearchParams } from 'next/navigation';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';

import ButtonPrint from '../../components/ButtonPrint';

import ButtonEndre from '../../components/ButtonEndre';
import formatDate from '../../utils/formatDate';
import { useEffect } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import formatTime from '../../utils/formatTime';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isBefore, isValid } from 'date-fns';
import env from '../../config/environment';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret, Periode, RefusjonskravetOpphoerer } from '../../state/state';
import skjemaVariant from '../../config/skjemavariant';

import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem';
import isValidUUID from '../../utils/isValidUUID';
import Fravaersperiode from '../../components/kvittering/Fravaersperiode';
import classNames from 'classnames/bind';
import useSkjemadataForespurt from '../../utils/useSkjemadataForespurt';
import { ForespurtData } from '../../schema/endepunktHentForespoerselSchema';
import parseIsoDate from '../../utils/parseIsoDate';
import { z } from 'zod';
import { delvisInnsendingSchema } from '../../schema/delvisInnsendingSchema';
import paakrevdOpplysningstyper from '../../utils/paakrevdeOpplysninger';

import useKvitteringInit from '../../state/useKvitteringInit';
import useKvitteringdata from '../../utils/useKvitteringdata';
import mottattKvitteringSchema from '../../schema/mottattKvitteringSchema';

type MottattKvitteringSchema = z.infer<typeof mottattKvitteringSchema>;
type DelvisInnsending = z.infer<typeof delvisInnsendingSchema>;

const Kvittering: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  kvittid
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initKvittering = useKvitteringInit();

  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  // const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  // const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  // const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const setInngangFraKvittering = useBoundStore((state) => state.setInngangFraKvittering);

  const kvitteringInnsendt = useBoundStore((state) => state.kvitteringInnsendt);

  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const kvitteringEksterntSystem = useBoundStore((state) => state.kvitteringEksterntSystem);
  const kvitteringSlug = kvittid || searchParams.get('kvittid');
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const kvitteringData = useBoundStore((state) => state.kvitteringData) as unknown as DelvisInnsending;
  const setKvitteringsdata = useBoundStore((state) => state.setKvitteringsdata);

  const {
    data: forespurtSkjema,
    error: forespurtSkjemaError,
    isLoading: forespurtSkjemaIsLoading
  } = useSkjemadataForespurt(kvittid, !!kvitteringData) as {
    data: ForespurtData;
    error: any;
    isLoading: boolean;
  };

  const {
    data: forespurtKvittering,
    error: forespurtKvitteringError,
    isLoading: forespurtKvitteringIsLoading
  } = useKvitteringdata(kvittid, !kvitteringData) as {
    data: MottattKvitteringSchema;
    error: any;
    isLoading: boolean;
  };

  const visningsdata = mapForespurtData(forespurtKvittering, forespurtSkjema, kvitteringData);

  const forespurtKvitteringDokument = forespurtKvittering?.kvitteringDokument;

  const refusjonEndringerUtenSkjaeringstidspunkt =
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

  const clickEndre = () => {
    const paakrevdeOpplysningstyper = hentPaakrevdOpplysningstyper();

    setInngangFraKvittering();

    if (!kvitteringData) {
      setKvitteringsdata({
        ...visningsdata
      });
    }
    if (isValidUUID(kvitteringSlug)) {
      if (paakrevdeOpplysningstyper.includes(skjemaVariant.arbeidsgiverperiode)) {
        router.push(`/${kvitteringSlug}`);
      } else {
        router.push(`/endring/${kvitteringSlug}`);
      }
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

  const ingenArbeidsgiverperioder = !harGyldigeArbeidsgiverperioder(arbeidsgiverperioder);

  const opplysningstyper = paakrevdOpplysningstyper(forespurtKvitteringDokument?.forespurtData);
  const paakrevdeOpplysninger = forespurtKvitteringDokument ? opplysningstyper : hentPaakrevdOpplysningstyper();

  const trengerArbeidsgiverperiode =
    forespurtSkjema?.forespurtData?.arbeidsgiverperiode?.paakrevd ??
    paakrevdeOpplysninger?.includes(skjemaVariant.arbeidsgiverperiode);

  const visningBestemmendeFravaersdag = trengerArbeidsgiverperiode
    ? (bestemmendeFravaersdag ?? kvitteringData?.bestemmendeFraværsdag)
    : (parseIsoDate(kvitteringData?.inntekt?.inntektsdato) ?? foreslaattBestemmendeFravaersdag);

  useEffect(() => {
    setNyInnsending(false);
    setOpprinneligNyMaanedsinntekt(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!forespurtSkjemaIsLoading) initKvittering(forespurtKvittering);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forespurtSkjemaIsLoading]);

  const visNaturalytelser = paakrevdeOpplysninger?.includes(skjemaVariant.arbeidsgiverperiode);
  const visArbeidsgiverperiode = paakrevdeOpplysninger?.includes(skjemaVariant.arbeidsgiverperiode);
  const visFullLonnIArbeidsgiverperioden = paakrevdeOpplysninger?.includes(skjemaVariant.arbeidsgiverperiode);

  const cx = classNames.bind(lokalStyles);
  const classNameWrapperFravaer = cx({
    fravaerswrapperwrapper: visArbeidsgiverperiode
  });

  const classNameWrapperSkjaeringstidspunkt = cx({
    infoboks: visArbeidsgiverperiode
  });

  const personData = {
    navn: visningsdata?.navn,
    identitetsnummer: visningsdata?.identitetsnummer,
    virksomhetsnavn: visningsdata?.orgNavn,
    orgnrUnderenhet: visningsdata?.orgnrUnderenhet,
    innsenderNavn: visningsdata?.innsenderNavn,
    innsenderTelefonNr: visningsdata?.telefonnummer ?? ''
  };

  const visningFravaersperioder =
    visningsdata?.fravaersperioder?.map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    })) ?? fravaersperioder;

  const visningEgenmeldingsperioder =
    kvitteringData?.agp?.egenmeldinger.map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    })) ?? egenmeldingsperioder;
  // const perioder: { fom: string; tom: string }[] = bruttoinntekt.endringAarsak && bruttoinntekt.endringAarsak[bruttoinntekt.endringAarsak.aarsak]:
  //   ? bruttoinntekt.endringAarsak[bruttoinntekt.endringAarsak.aarsak as string]
  //   : [];
  // const gjelderFra = bruttoinntekt.endringAarsak?.gjelderFra ? bruttoinntekt.endringAarsak?.gjelderFra : '';
  // const bleKjent = bruttoinntekt.endringAarsak?.bleKjent ? bruttoinntekt.endringAarsak?.bleKjent : '';

  const lonnISykefravaeret: LonnISykefravaeret = {
    beloep: visningsdata?.refusjon?.beloepPerMaaned,
    status: visningsdata?.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei'
  };

  const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
    status: visningsdata?.refusjon?.opphoersdato ? 'Ja' : 'Nei',
    opphoersdato: visningsdata?.refusjon?.opphoersdato ? parseIsoDate(visningsdata?.refusjon?.opphoersdato) : undefined
  };

  const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
    status: visningsdata?.refusjon?.opphoersdato ? 'Ja' : 'Nei',
    utbetalt: visningsdata?.refusjon?.beloepPerMaaned,
    begrunnelse: visningsdata?.refusjon?.opphoersdato ? 'Ja' : 'Nei'
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
          {kvitteringEksterntSystem?.avsenderSystem && (
            <KvitteringAnnetSystem
              arkivreferanse={kvitteringEksterntSystem.referanse}
              eksterntSystem={kvitteringEksterntSystem.avsenderSystem}
              mottattDato={innsendingstidspunkt}
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

              <Person erKvittering={true} personData={personData} />
              <Skillelinje />
              <div className={classNameWrapperFravaer}>
                {visArbeidsgiverperiode && (
                  <Fravaersperiode
                    fravaersperioder={visningFravaersperioder}
                    egenmeldingsperioder={visningEgenmeldingsperioder}
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
                          <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Skillelinje />
              <Heading2>Beregnet månedslønn</Heading2>
              <BodyShort className={lokalStyles.uthevet}>Registrert inntekt</BodyShort>
              <BodyShort>{formatCurrency(visningsdata?.inntekt?.beregnetInntekt)} kr/måned</BodyShort>
              {visningsdata?.inntekt?.endringAarsak?.aarsak && (
                <>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(visningsdata?.inntekt?.endringAarsak.aarsak as string)}
                  <EndringAarsakVisning endringAarsak={visningsdata?.inntekt?.endringAarsak} />
                </>
              )}
              <Skillelinje />
              <Heading2>Refusjon</Heading2>
              {visFullLonnIArbeidsgiverperioden && (
                <>
                  <div className={lokalStyles.uthevet}>
                    Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
                  </div>
                  <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden} />
                </>
              )}
              <LonnUnderSykefravaeret
                loenn={lonnISykefravaeret!}
                refusjonskravetOpphoerer={refusjonskravetOpphoerer}
                harRefusjonEndringer={harRefusjonEndringer}
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
          <div className={lokalStyles.buttonwrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              {!kvitteringEksterntSystem?.avsenderSystem && <ButtonEndre onClick={clickEndre} />}
              <Link className={lokalStyles.lukkelenke} href={env.saksoversiktUrl}>
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

function harGyldigeArbeidsgiverperioder(arbeidsgiverperioder: Periode[] | undefined): boolean {
  return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
    ? arbeidsgiverperioder?.filter(
        (periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom))
      ).length > 0
    : false;
}

export async function getServerSideProps(context: any) {
  const kvittid = context.query.kvittid;

  return {
    props: {
      kvittid
    }
  };
}

function mapForespurtData(
  forespurtKvittering: MottattKvitteringSchema,
  forespurtSkjema: ForespurtData,
  kvitteringData: DelvisInnsending
): ForespurtData | undefined {
  if (!kvitteringData && forespurtKvittering?.kvitteringDokument) {
    const data = forespurtKvittering?.kvitteringDokument;
    if (!data) return undefined;
    return {
      ...data,
      navn: data.fulltNavn,
      identitetsnummer: data.identitetsnummer,
      orgnrUnderenhet: data.orgnrUnderenhet,
      orgNavn: data.virksomhetNavn,
      innsenderNavn: data.innsenderNavn,
      telefonnummer: data.telefonnummer,
      egenmeldingsperioder: data.egenmeldingsperioder,
      arbeidsgiverperioder: data.arbeidsgiverperioder,
      bestemmendeFravaersdag: data?.bestemmendeFraværsdag,
      fravaersperioder: data.fraværsperioder,
      inntekt: {
        ...data?.inntekt,
        bekreftet: !!data?.inntekt?.beloep ? 'Ja' : 'Nei',
        beloep: kvitteringData?.inntekt?.beregnetInntekt,
        manueltKorrigert: kvitteringData?.inntekt?.manueltKorrigert
      },
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: data.fullLønnIArbeidsgiverPerioden?.utbetalerFullLønn
      },
      refusjon: {
        ...data.refusjon?.utbetalerHeleEllerDeler
      }
      // forespurtData: data.forespurtData
    };
  } else {
    return {
      ...forespurtSkjema,
      telefonnummer: kvitteringData?.avsenderTlf,
      refusjon: kvitteringData?.refusjon,
      inntekt: { ...kvitteringData?.inntekt, beregnetInntekt: kvitteringData?.inntekt?.beloep }
    };
  }
}
