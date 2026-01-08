import { Fragment, useEffect, useEffectEvent, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../../components/PageContent/PageContent';

import lokalStyles from '../Kvittering.module.css';
import styles from '../../../styles/Home.module.css';

import Heading2 from '../../../components/Heading2/Heading2';
import { BodyLong, BodyShort } from '@navikt/ds-react';

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
import { EndringsBeloep } from '../../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import useRefusjonEndringerUtenSkjaeringstidspunkt from '../../../utils/useRefusjonEndringerUtenSkjaeringstidspunkt';
import { PeriodeSchema } from '../../../schema/KonverterPeriodeSchema';
import { useShallow } from 'zustand/react/shallow';
import { ApiNaturalytelserSchema } from '../../../schema/ApiNaturalytelserSchema';
import NaturalytelserSchema from '../../../schema/NaturalytelserSchema';
import {
  MappedKvitteringAgiData,
  mapKvitteringAgiData,
  deserializePerioderTilInterntFormat,
  deserializeNaturalytelser,
  deserializeEndringsBeloep,
  PersonData,
  SerializedPeriode,
  ApiKvitteringResponse,
  ApiEndringAarsak
} from '../../../utils/mapKvitteringAgiData';
import { SelvbestemtType } from '../../../schema/konstanter/selvbestemtType';

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

interface KvitteringProps {
  kvittid: string;
  mappedData: MappedKvitteringAgiData | null;
  dataFraBackend: boolean;
  kvitteringStatus?: number;
}

const Kvittering: NextPage<KvitteringProps> = ({ kvittid, mappedData, dataFraBackend = false }: KvitteringProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    gammeltSkjaeringstidspunkt
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
      state.gammeltSkjaeringstidspunkt
    ])
  );
  const kvitteringInit = useKvitteringInit();

  // Cast til any for å håndtere union type - feltene er kun tilgjengelige når dataFraBackend er false
  const kvitteringDataAny = kvitteringData as any;

  // Bruk mappet data fra server når tilgjengelig, ellers fall tilbake til store
  const personData: PersonData = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.personData;
    }
    return {
      navn: sykmeldt.navn ?? '',
      identitetsnummer: kvitteringDataAny?.sykmeldtFnr ?? '',
      orgnrUnderenhet: kvitteringDataAny?.avsender?.orgnr ?? '',
      virksomhetNavn: avsender.orgNavn ?? '',
      innsenderNavn: avsender.navn ?? '',
      innsenderTelefonNr: kvitteringDataAny?.avsender?.tlf ?? ''
    };
  }, [dataFraBackend, mappedData, sykmeldt, kvitteringDataAny, avsender]);

  const sykmeldingsperioder: Periode[] = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return deserializePerioderTilInterntFormat(mappedData.sykmeldingsperioder);
    }
    return kvitteringDataAny?.sykmeldingsperioder
      ? mapPerioderTilInterntFormat(kvitteringDataAny.sykmeldingsperioder)
      : [];
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const egenmeldingsperioder: Periode[] = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return deserializePerioderTilInterntFormat(mappedData.egenmeldingsperioder);
    }
    return kvitteringDataAny?.agp?.egenmeldinger
      ? mapPerioderTilInterntFormat(kvitteringDataAny.agp.egenmeldinger)
      : [];
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const arbeidsgiverperioder = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.arbeidsgiverperioder;
    }
    return kvitteringDataAny?.agp?.perioder ?? [];
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const inntekt = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.inntekt;
    }
    return { beregnetInntekt: kvitteringDataAny?.inntekt?.beloep };
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const fullLoennIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.fullLoennIArbeidsgiverPerioden;
    }
    return {
      status: kvitteringDataAny?.agp?.redusertLoennIAgp ? 'Nei' : 'Ja',
      utbetalt: kvitteringDataAny?.agp?.redusertLoennIAgp?.beloep,
      begrunnelse: kvitteringDataAny?.agp?.redusertLoennIAgp?.begrunnelse
    };
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const loenn: LonnISykefravaeret = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.loenn;
    }
    return {
      status: kvitteringDataAny?.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei',
      beloep: kvitteringDataAny?.refusjon?.beloepPerMaaned
    };
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const visningNaturalytelser = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return deserializeNaturalytelser(mappedData.naturalytelser);
    }
    return mapNaturalytelserTilInterntFormat(kvitteringDataAny?.naturalytelser);
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const visningEndringAarsaker = useMemo(() => {
    if (dataFraBackend && mappedData) {
      return mappedData.endringAarsaker;
    }
    return kvitteringDataAny?.inntekt?.endringAarsaker ?? lagretEndringAarsaker;
  }, [dataFraBackend, mappedData, kvitteringDataAny, lagretEndringAarsaker]);

  const bestemmendeFravaersdag =
    dataFraBackend && mappedData ? mappedData.bestemmendeFravaersdag : kvitteringDataAny?.inntekt?.inntektsdato;

  const visningBestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);

  const kvitteringInnsendt = useMemo(() => {
    const tidspunkt = dataFraBackend && mappedData ? mappedData.innsendingstidspunkt : kvitteringDataAny?.tidspunkt;
    return tidspunkt ? new Date(tidspunkt) : null;
  }, [dataFraBackend, mappedData, kvitteringDataAny]);

  const innsendingstidspunkt =
    kvitteringInnsendt && isValid(kvitteringInnsendt)
      ? ` - ${formatDate(kvitteringInnsendt)} kl. ${formatTime(kvitteringInnsendt)}`
      : '';

  // Refusjon endringer
  const innsendtRefusjonEndringerUtenSkjaeringstidspunkt = useRefusjonEndringerUtenSkjaeringstidspunkt();

  const refusjonEndringerUtenSkjaeringstidspunkt: EndringsBeloep[] | undefined = useMemo(() => {
    if (dataFraBackend && mappedData) {
      const refusjonEndringer = deserializeEndringsBeloep(mappedData.refusjonEndringer);
      return refusjonEndringer.filter((endring) => {
        return (
          !endring.dato ||
          !bestemmendeFravaersdag ||
          !gammeltSkjaeringstidspunkt ||
          (!isEqual(endring.dato, new Date(bestemmendeFravaersdag)) &&
            !isEqual(endring.dato, gammeltSkjaeringstidspunkt))
        );
      });
    }
    return innsendtRefusjonEndringerUtenSkjaeringstidspunkt;
  }, [
    dataFraBackend,
    mappedData,
    bestemmendeFravaersdag,
    gammeltSkjaeringstidspunkt,
    innsendtRefusjonEndringerUtenSkjaeringstidspunkt
  ]);

  const clickEndre = () => {
    const input = dataFraBackend && mappedData ? mappedData.rawKvittering : kvitteringData;

    const kvittering = prepareForInitiering(input);
    kvitteringInit({ kvitteringNavNo: kvittering, kvitteringDokument: null, kvitteringEkstern: null });

    if (input?.agp?.perioder) {
      setBehandlingsdager(input.agp.perioder.map((periode: MottattPeriode) => periode.fom));
    }

    if (isValidUUID(kvittid)) {
      router.push(`/${kvittid}?endre=true`);
    }
  };

  const ingenArbeidsgiverperioder = arbeidsgiverperioder && arbeidsgiverperioder.length === 0;

  const paakrevdeOpplysninger = ['arbeidsgiverperiode', 'naturalytelser', 'refusjon'];

  const onSetNyInnsending = useEffectEvent(() => {
    setNyInnsending(false);
  });

  useEffect(() => {
    onSetNyInnsending();
  }, [searchParams]);

  const visNaturalytelser = true;
  const visArbeidsgiverperiode = true;
  const visFullLonnIArbeidsgiverperioden = true;

  const classNameWrapperFravaer = visArbeidsgiverperiode ? lokalStyles.fravaerswrapperwrapper : '';
  const classNameWrapperSkjaeringstidspunkt = visArbeidsgiverperiode ? lokalStyles.infoboks : '';

  // Set vedtaksperiodeId og selvbestemt type
  const onsetSkjemaStatus = useEffectEvent(() => {
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);

    if (dataFraBackend && mappedData) {
      if (mappedData.vedtaksperiodeId) {
        setVedtaksperiodeId(mappedData.vedtaksperiodeId);
      }
      if (mappedData.selvbestemtType) {
        setSelvbestemtType(mappedData.selvbestemtType as SelvbestemtType);
      }
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
                    <div data-cy='bestemmendefravaersdag'>{formatDate(visningBestemmendeFravaersdag)} </div>
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
                    {arbeidsgiverperioder?.map((periode: SerializedPeriode | z.infer<typeof PeriodeSchema>) => (
                      <PeriodeFraTil
                        fom={parseIsoDate(periode.fom)}
                        tom={parseIsoDate(periode.tom)}
                        key={'id' in periode ? periode.id : `${periode.fom}-${periode.tom}`}
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

          {visningEndringAarsaker?.map((endring: EndringAarsak | ApiEndringAarsak, endringIndex: number) => (
            <Fragment key={endring?.aarsak + endringIndex}>
              <div className={lokalStyles.uthevet}>Endret med årsak</div>

              {formatBegrunnelseEndringBruttoinntekt(endring?.aarsak as string)}
              <EndringAarsakVisning endringAarsak={endring as EndringAarsak} />
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
            harRefusjonEndringer={harGyldigeRefusjonEndringer(refusjonEndringerUtenSkjaeringstidspunkt) ? 'Ja' : 'Nei'}
            refusjonEndringer={refusjonEndringerUtenSkjaeringstidspunkt}
          />
          {visNaturalytelser && (
            <>
              <Skillelinje />
              <Heading2>Eventuelle naturalytelser</Heading2>
              <BortfallNaturalytelser ytelser={visningNaturalytelser!} />
            </>
          )}
          <Skillelinje />

          <BodyShort>Kvittering - innsendt inntektsmelding{innsendingstidspunkt}</BodyShort>
          <div className={lokalStyles.buttonWrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.innerbuttonwrapper}>
              <ButtonEndre onClick={clickEndre} />
              <Link className={lokalStyles.lukkelenke} href={environment.saksoversiktUrl!}>
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

type KvitteringNavNoSchema = z.infer<typeof KvitteringNavNoSchema>;

function prepareForInitiering(kvitteringData: any): KvitteringNavNoSchema {
  const kvittering: KvitteringNavNoSchema = {
    sykmeldt: kvitteringData.sykmeldt,
    avsender: kvitteringData.avsender,
    sykmeldingsperioder: kvitteringData.sykmeldingsperioder ?? [],
    skjema: {
      agp: kvitteringData.agp ?? null,
      inntekt: { ...kvitteringData.inntekt },
      refusjon: kvitteringData.refusjon ?? null,
      naturalytelser: kvitteringData.naturalytelser ?? null
    },
    mottatt: kvitteringData.tidspunkt
  };

  return kvittering;
}

export async function getServerSideProps(context: any) {
  const result = await getKvitteringServerSideProps<ApiKvitteringResponse>({
    context,
    fetchKvittering: hentKvitteringsdataAgiSSR as any, // Type assertion for legacy compatibility
    checkDataFraBackend: (data, fromSubmit) =>
      !fromSubmit && !!(data?.success?.selvbestemtInntektsmelding || data?.selvbestemtInntektsmelding),
    errorLogMessage: 'Error fetching selvbestemt kvittering:'
  });

  if ('redirect' in result || 'notFound' in result) {
    return result;
  }

  const { kvittid, kvittering, dataFraBackend, kvitteringStatus } = result.props;

  // Map data på serveren når det kommer fra backend
  const mappedData = dataFraBackend ? mapKvitteringAgiData(kvittering) : null;

  return {
    props: {
      kvittid,
      mappedData,
      dataFraBackend,
      kvitteringStatus
    }
  };
}
