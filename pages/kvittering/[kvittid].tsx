import { NextPage } from 'next';
import Head from 'next/head';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import { BodyLong, BodyShort, Button, Skeleton, TextField } from '@navikt/ds-react';
import Person from '../../components/Person/Person';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';

import ButtonPrint from '../../components/ButtonPrint';

import ButtonEndre from '../../components/ButtonEndre';
import formatDate from '../../utils/formatDate';
import { useEffect } from 'react';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import formatTime from '../../utils/formatTime';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';
import { isValid } from 'date-fns';
import env from '../../config/environment';
import { Periode } from '../../state/state';
import skjemaVariant from '../../config/skjemavariant';

import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem/KvitteringAnnetSystem';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import isValidUUID from '../../utils/isValidUUID';
import Fravaersperiode from '../../components/kvittering/Fravaersperiode';
import classNames from 'classnames/bind';
import useSendInnFeedback from '../../utils/useSendInnFeedback';

const Kvittering: NextPage = () => {
  const router = useRouter();

  const hentKvitteringsdata = useHentKvitteringsdata();

  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const setNyInnsending = useBoundStore((state) => state.setNyInnsending);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permittering = useBoundStore((state) => state.permittering);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const kvitteringInnsendt = useBoundStore((state) => state.kvitteringInnsendt);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const tariffendringsdato = useBoundStore((state) => state.tariffendringsdato);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const kvitteringEksterntSystem = useBoundStore((state) => state.kvitteringEksterntSystem);

  const [respons, setRespons] = useState<string>('');

  const sendInnFeedback = useSendInnFeedback();

  const sendResponse = () => {
    sendInnFeedback({
      svar: respons,
      feedbackId: 'DelvisSkjema',
      sporsmal: 'Hva synes du om delvis utfylling av skjema?',
      app: 'spinntektsmalding-frontend'
    });
  };

  const clickEndre = () => {
    const paakrevdeOpplysningstyper = hentPaakrevdOpplysningstyper();

    const kvitteringSlug = (router.query.kvittid as string) || '';

    if (paakrevdeOpplysningstyper.length === 3) {
      if (isValidUUID(kvitteringSlug)) {
        router.push(`/${kvitteringSlug}`, undefined, { shallow: true });
      }
    } else {
      if (isValidUUID(kvitteringSlug)) {
        router.push(`/endring/${kvitteringSlug}`, undefined, { shallow: true });
      }
    }
  };

  const paakrevdeOpplysninger = hentPaakrevdOpplysningstyper();

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

  useEffect(() => {
    if (!fravaersperioder) {
      const kvitteringSlug = (router.query.kvittid as string) || '';
      if (!kvitteringSlug || kvitteringSlug === '') return;
      hentKvitteringsdata(kvitteringSlug);
    }
    setNyInnsending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.kvittid]);

  useEffect(() => {
    setOpprinneligNyMaanedsinntekt(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <Person erKvittering={true} />
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
                          {bestemmendeFravaersdag ? formatDate(bestemmendeFravaersdag) : <Skeleton variant='text' />}{' '}
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
              <BodyShort>{formatCurrency(bruttoinntekt.bruttoInntekt)} kr/måned</BodyShort>
              {bruttoinntekt.endringsaarsak && (
                <>
                  <div className={lokalStyles.uthevet}>Endret med årsak</div>

                  {formatBegrunnelseEndringBruttoinntekt(bruttoinntekt.endringsaarsak as string)}
                  <EndringAarsakVisning
                    endringsaarsak={bruttoinntekt.endringsaarsak as keyof typeof begrunnelseEndringBruttoinntekt}
                    ferie={ferie}
                    lonnsendringsdato={lonnsendringsdato}
                    permisjon={permisjon}
                    permittering={permittering}
                    nystillingdato={nystillingdato}
                    nystillingsprosentdato={nystillingsprosentdato}
                    tariffendringDato={tariffendringsdato}
                    tariffkjentdato={tariffkjentdato}
                    sykefravaer={sykefravaerperioder}
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
                  <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden!} />
                </>
              )}
              <div className={lokalStyles.uthevet}>
                Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?
              </div>
              <LonnUnderSykefravaeret
                lonn={lonnISykefravaeret!}
                refusjonskravetOpphoerer={refusjonskravetOpphoerer}
                harRefusjonEndringer={harRefusjonEndringer}
                refusjonEndringer={refusjonEndringer}
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
        <TextField label='Ka du trur?' onChange={(event) => setRespons(event.target.value)} />
        <Button onClick={() => sendResponse()}>Send respons</Button>
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
