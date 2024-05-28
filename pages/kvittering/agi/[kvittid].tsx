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
import { isEqual, isValid } from 'date-fns';
import env from '../../../config/environment';
import { LonnISykefravaeret, Periode, RefusjonskravetOpphoerer, YesNo } from '../../../state/state';
import skjemaVariant from '../../../config/skjemavariant';

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

const Kvittering: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  kvittid,
  kvittering
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const kvitteringData = useBoundStore((state) => state.kvitteringData);

  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);

  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const [navn, virksomhetsnavn, innsenderNavn] = useBoundStore((state) => [
    state.navn,
    state.virksomhetsnavn,
    state.innsenderNavn
  ]);

  const kvitteringEksterntSystem = kvittering?.kvitteringEkstern;
  const kvitteringSlug = kvittid || searchParams.get('kvittid');
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const dataFraBackend = !!kvittering;

  const kvitteringInit = useKvitteringInit();

  const kvitteringDokument = kvittering?.kvitteringDokument ? kvittering?.kvitteringDokument : kvitteringData;

  const kvitteringInnsendt = new Date(kvitteringDokument?.tidspunkt);
  // const egenmeldingsperioder = kvitteringDokument?.egenmeldingsperioder;
  // const fravaersperioder = kvitteringDokument?.fraværsperioder;
  const bestemmendeFravaersdag = kvitteringDokument?.bestemmendeFraværsdag;
  const arbeidsgiverperioder = dataFraBackend
    ? kvitteringDokument?.arbeidsgiverperioder
    : kvitteringData?.agp?.perioder;

  const personData = dataFraBackend
    ? {
        navn: kvitteringDokument.fulltNavn,
        identitetsnummer: kvitteringDokument.identitetsnummer,
        orgnrUnderenhet: kvitteringDokument.orgnrUnderenhet,
        virksomhetNavn: kvitteringDokument.virksomhetNavn,
        innsenderNavn: kvitteringDokument.innsenderNavn,
        innsenderTelefonNr: kvitteringDokument.telefonnummer
      }
    : {
        navn: navn,
        identitetsnummer: kvitteringData.sykmeldtFnr,
        orgnrUnderenhet: kvitteringData.avsender.orgnr,
        virksomhetNavn: virksomhetsnavn,
        innsenderNavn: innsenderNavn,
        innsenderTelefonNr: kvitteringData.avsender.tlf
      };

  const clickEndre = () => {
    const paakrevdeOpplysningstyper = hentPaakrevdOpplysningstyper();

    // Må lagre data som kan endres i hovedskjema - Start
    kvitteringInit(kvittering);
    // Må lagre data som kan endres i hovedskjema - Slutt

    if (paakrevdeOpplysningstyper.includes(skjemaVariant.arbeidsgiverperiode)) {
      if (isValidUUID(kvitteringSlug)) {
        router.push(`/${kvitteringSlug}`);
      }
    } else {
      if (isValidUUID(kvitteringSlug)) {
        router.push(`/endring/${kvitteringSlug}`);
      }
    }
  };
  console.log('kvitteringData', kvitteringData);
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
    ? parseIsoDate(bestemmendeFravaersdag)
    : parseIsoDate(kvitteringData.inntekt.inntektsdato);

  useEffect(() => {
    setNyInnsending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const visNaturalytelser = true;
  const visArbeidsgiverperiode = true;
  const visFullLonnIArbeidsgiverperioden = true;
  const inntekt = dataFraBackend
    ? kvitteringDokument.inntekt
    : {
        beregnetInntekt: kvitteringData.inntekt.beloep
      };

  let fravaersperioder: Periode[] = [];
  let egenmeldingsperioder: Periode[] = [];
  if (dataFraBackend) {
    fravaersperioder = kvitteringDokument.fraværsperioder?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));

    egenmeldingsperioder = kvitteringDokument.egenmeldingsperioder?.map((periode: MottattPeriode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));
  } else {
    fravaersperioder = kvitteringData.agp.perioder?.map((periode: MottattPeriode) => ({
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
    fullLoennIArbeidsgiverPerioden = kvitteringDokument.fullLønnIArbeidsgiverPerioden ?? {};
    fullLoennIArbeidsgiverPerioden.status = fullLoennIArbeidsgiverPerioden?.utbetalerFullLønn ? 'Ja' : 'Nei';
  } else {
    fullLoennIArbeidsgiverPerioden = { status: '', utbetalt: 0, begrunnelse: '' };
    fullLoennIArbeidsgiverPerioden.status = kvitteringData.agp.redusertLoennIAgp ? 'Nei' : 'Ja'; // kvitteringData.agp.redusertLoennIAgp?.beloep ? 'Ja' : 'Nei';
    fullLoennIArbeidsgiverPerioden.utbetalt = kvitteringData.agp.redusertLoennIAgp?.beloep;
    fullLoennIArbeidsgiverPerioden.begrunnelse = kvitteringData.agp.redusertLoennIAgp?.begrunnelse;

    console.log('fullLoennIArbeidsgiverPerioden', fullLoennIArbeidsgiverPerioden);
  }

  let loenn: LonnISykefravaeret = { status: undefined, beloep: 0 };
  if (dataFraBackend) {
    loenn = {
      status: kvitteringDokument.refusjon?.utbetalerHeleEllerDeler ? 'Ja' : 'Nei',
      beloep: kvitteringDokument.refusjon?.refusjonPrMnd
    };
  } else {
    loenn = {
      status: kvitteringData.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei',
      beloep: kvitteringData.refusjon?.beloepPerMaaned
    };
  }

  let refusjonskravetOpphoerer: RefusjonskravetOpphoerer = { status: undefined, opphoersdato: undefined };
  if (dataFraBackend) {
    refusjonskravetOpphoerer = {
      status: kvitteringDokument?.refusjon?.refusjonOpphører ? 'Ja' : ('Nei' as YesNo),
      opphoersdato: parseIsoDate(kvitteringDokument.refusjon?.refusjonOpphører)
    };
  } else {
    refusjonskravetOpphoerer = {
      status: kvitteringData.refusjon?.sluttdato ? 'Ja' : 'Nei',
      opphoersdato: kvitteringData.refusjon?.sluttdato ? parseIsoDate(kvitteringData.refusjon?.sluttdato) : undefined
    };
  }

  let refusjonEndringer = [];
  if (dataFraBackend) {
    refusjonEndringer = kvitteringDokument?.refusjon?.refusjonEndringer?.map((endring) => ({
      dato: parseIsoDate(endring.dato),
      beloep: endring.beløp
    }));
  } else {
    refusjonEndringer = kvitteringData.refusjon?.endringer
      ? kvitteringData.refusjon?.endringer.map((endring) => ({
          dato: parseIsoDate(endring.startDato),
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
        (!isEqual(endring.dato, bestemmendeFravaersdag) && !isEqual(endring.dato!, gammeltSkjaeringstidspunkt))
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
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />

      <PageContent title='Kvittering - innsendt inntektsmelding' jsxItem={<ButtonEndre onClick={clickEndre} />}>
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
              {inntekt.endringÅrsak && (
                <>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(inntekt.endringÅrsak.typpe as string)}
                  <EndringAarsakVisning
                    aarsak={inntekt.endringÅrsak.typpe}
                    gjelderFra={inntekt.endringÅrsak.gjelderFra}
                    bleKjent={inntekt.endringÅrsak.bleKjent}
                    perioder={inntekt.endringÅrsak.liste}
                  />
                </>
              )}
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
          <div className={lokalStyles.buttonwrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              {!kvitteringEksterntSystem?.avsenderSystem && <ButtonEndre onClick={clickEndre} />}
              <Link className={lokalStyles.lukkelenke} href={env.minSideArbeidsgiver}>
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

export async function getServerSideProps(context: any) {
  const kvittid = context.query.kvittid;

  let kvittering = null;

  try {
    kvittering = await hentKvitteringsdataSSR(kvittid);
  } catch (error) {
    kvittering = { data: null };
  }

  return {
    props: {
      kvittid,
      kvittering: kvittering?.data
    }
  };
}
