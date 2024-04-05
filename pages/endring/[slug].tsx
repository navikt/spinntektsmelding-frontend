import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BodyLong, Button, ConfirmationPanel, Link } from '@navikt/ds-react';
import { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import formatCurrency from '../../utils/formatCurrency';
import useBoundStore from '../../state/useBoundStore';
import lokalStyles from './Endring.module.css';
import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Heading2 from '../../components/Heading2/Heading2';
import H3Label from '../../components/H3Label';
import { useSearchParams } from 'next/navigation';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
import logEvent from '../../utils/logEvent';
import environment from '../../config/environment';
import IngenTilgang from '../../components/IngenTilgang';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';
import useSendInnDelvisSkjema from '../../utils/useSendInnDelvisSkjema';
import { isAfter, isBefore } from 'date-fns';
import parseIsoDate from '../../utils/parseIsoDate';
import delvisInnsendingSchema from '../../schema/delvisInnsendingSchema';
import FancyJaNei from '../../components/FancyJaNei/FancyJaNei';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import RefusjonArbeidsgiverBeloep from '../../components/RefusjonArbeidsgiverBeloep/RefusjonArbeidsgiverBeloep';
import EndringRefusjon from '../../components/EndringRefusjon/EndringRefusjon';
import DatoVelger from '../../components/DatoVelger/DatoVelger';
import PersonData from '../../components/PersonData/PersonData';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import { LonnISykefravaeret, Periode, YesNo } from '../../state/state';
import mapErrorsObjectToFeilmeldinger from '../../utils/mapErrorsObjectToFeilmeldinger';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';

const Endring: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  type Skjema = z.infer<typeof delvisInnsendingSchema>;
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const [setEndringerAvRefusjon] = useBoundStore((state) => [state.setEndringerAvRefusjon]);

  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const tariffendringDato = useBoundStore((state) => state.tariffendringDato);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permittering = useBoundStore((state) => state.permittering);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const setBareNyMaanedsinntekt = useBoundStore((state) => state.setBareNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);

  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);

  // Bruttoinntekt
  const setTariffEndringsdato = useBoundStore((state) => state.setTariffEndringsdato);
  const setTariffKjentdato = useBoundStore((state) => state.setTariffKjentdato);
  const setFeriePeriode = useBoundStore((state) => state.setFeriePeriode);
  const setLonnsendringDato = useBoundStore((state) => state.setLonnsendringDato);
  const setPermisjonPeriode = useBoundStore((state) => state.setPermisjonPeriode);
  const setPermitteringPeriode = useBoundStore((state) => state.setPermitteringPeriode);
  const setNyStillingDato = useBoundStore((state) => state.setNyStillingDato);
  const setNyStillingsprosentDato = useBoundStore((state) => state.setNyStillingsprosentDato);
  const setSykefravaerPeriode = useBoundStore((state) => state.setSykefravaerPeriode);
  // Bruttoinntekt slutt

  const [
    initLonnISykefravaeret,
    initRefusjonEndringer,
    setInnsenderTelefon,
    refusjonskravetOpphoererDato,
    refusjonskravetOpphoererStatus,
    setHarRefusjonEndringer,
    initRefusjonskravetOpphoerer
  ] = useBoundStore((state) => [
    state.initLonnISykefravaeret,
    state.initRefusjonEndringer,
    state.setInnsenderTelefon,
    state.refusjonskravetOpphoererDato,
    state.refusjonskravetOpphoererStatus,
    state.setHarRefusjonEndringer,
    state.initRefusjonskravetOpphoerer
  ]);

  const searchParams = useSearchParams();

  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const ukjentInntekt = useBoundStore((state) => state.ukjentInntekt);

  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);

  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const kanBruttoinntektTilbakebestilles = useBoundStore((state) => state.kanBruttoinntektTilbakebestilles);
  const forespurtData = useBoundStore((state) => state.forespurtData);
  const [opprinneligRefusjonEndringer, opprinneligRefusjonskravetOpphoerer, harRefusjonEndringer] = useBoundStore(
    (state) => [
      state.opprinneligRefusjonEndringer,
      state.opprinneligRefusjonskravetOpphoerer,
      state.harRefusjonEndringer
    ]
  );
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);

  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const aapentManglendeData = inngangFraKvittering || ukjentInntekt;

  const [innsenderTelefonNr] = useBoundStore((state) => [state.innsenderTelefonNr]);

  const amplitudeComponent = 'DelvisInnsending';

  const hentKvitteringsdata = useHentKvitteringsdata();

  const foersteDatoForRefusjon = skjaeringstidspunkt ?? bestemmendeFravaersdag;

  const refusjonEndringerUtenSkjaeringstidspunkt =
    foersteDatoForRefusjon && refusjonEndringer
      ? refusjonEndringer?.filter((endring) => {
          if (!endring.dato) return false;
          return isAfter(endring.dato, foersteDatoForRefusjon);
        })
      : refusjonEndringer;

  const refusjonPrMnd = !nyInnsending
    ? lonnISykefravaeret!.beloep ?? bruttoinntekt?.bruttoInntekt
    : refusjonEndringer
        ?.filter((endring) => {
          if (!endring.dato) return false;
          return !isAfter(endring.dato, foersteDatoForRefusjon);
        })
        .map((endring) => {
          return {
            beloep: endring.beloep,
            dato: endring.dato
          };
        })
        .sort((a, b) => {
          return a.dato && b.dato ? (a.dato < b.dato ? 1 : -1) : 0;
        })[0]?.beloep;

  const aktiveRefusjonEndringer = nyInnsending
    ? refusjonEndringerUtenSkjaeringstidspunkt && refusjonEndringerUtenSkjaeringstidspunkt.length > 0
      ? refusjonEndringerUtenSkjaeringstidspunkt
      : [{ beloep: undefined, dato: undefined }]
    : refusjonEndringer;

  const opprinneligRefusjonskravetOpphoererStatus = opprinneligRefusjonskravetOpphoerer?.status;
  const opprinneligRefusjonskravetOpphoererDato = opprinneligRefusjonskravetOpphoerer?.opphoersdato;

  const methods = useForm<Skjema>({
    resolver: zodResolver(delvisInnsendingSchema),
    defaultValues: {
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt
      },
      telefon: innsenderTelefonNr,
      opplysningerBekreftet: false,
      refusjon: {
        refusjonPrMnd: refusjonPrMnd,
        refusjonEndringer: aktiveRefusjonEndringer,
        harEndringer:
          refusjonEndringerUtenSkjaeringstidspunkt && refusjonEndringerUtenSkjaeringstidspunkt.length > 0
            ? 'Ja'
            : 'Nei',
        refusjonOpphoerer: opprinneligRefusjonskravetOpphoererDato,
        kravetOpphoerer: opprinneligRefusjonskravetOpphoererStatus,
        kreverRefusjon: refusjonPrMnd !== 0 && typeof refusjonPrMnd !== 'undefined' ? 'Ja' : 'Nei'
      }
    }
  });

  const {
    unregister,
    setValue,
    setError,
    register,
    watch,
    formState: { isDirty, errors }
  } = methods;

  const harEndringBruttoloenn = watch('inntekt.endringBruttoloenn');

  const harEndringRefusjon = watch('refusjon.erDetEndringRefusjon');

  const skalRefusjonskravetOpphoere = watch('refusjon.kravetOpphoerer');

  const arbeidsgiverKreverRefusjon = watch('refusjon.kreverRefusjon');

  useEffect(() => {
    if (refusjonPrMnd) {
      setValue('refusjon.refusjonPrMnd', refusjonPrMnd);
    }
  }, [refusjonPrMnd, setValue]);

  useEffect(() => {
    if (ukjentInntekt) {
      setValue('inntekt.endringBruttoloenn', 'Ja');
    }
  }, [ukjentInntekt, setValue]);

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt) {
      setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [bruttoinntekt.bruttoInntekt, setValue]);

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.minSideArbeidsgiver;
  };

  const pathSlug = slug || (searchParams.get('slug') as string);

  const clickTilbakestillMaanedsinntekt = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      logEvent('knapp klikket', {
        tittel: 'Tilbakestill beregnet månedsinntekt',
        component: amplitudeComponent
      });

      tilbakestillMaanedsinntekt();
    },
    [tilbakestillMaanedsinntekt]
  );

  useEffect(() => {
    if (!fravaersperioder && pathSlug) {
      const slug = pathSlug as string;
      hentKvitteringsdata(slug);
      setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    }
    if (pathSlug) {
      setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug]);

  const forsteFravaersdag = foreslaattBestemmendeFravaersdag;

  const sendInnDelvisSkjema = useSendInnDelvisSkjema(setIngenTilgangOpen, amplitudeComponent, setError);

  const submitForm: SubmitHandler<Skjema> = (skjemaData: Skjema) => {
    setSenderInn(true);
    console.log('skjemaData.inntekt.beloep', skjemaData.inntekt.beloep);
    if (skjemaData.inntekt.beloep) {
      setBareNyMaanedsinntekt(skjemaData.inntekt.beloep.toString());
    }
    console.log('bruttoinntekt.bruttoInntekt', bruttoinntekt.bruttoInntekt);

    sendInnDelvisSkjema(true, pathSlug, isDirty, skjemaData).finally(() => {
      const lonnISykefravaeretGreier: LonnISykefravaeret = {
        beloep: skjemaData.refusjon.refusjonPrMnd,
        status: skjemaData.refusjon.kreverRefusjon
      };

      console.log('skjemaData', skjemaData);

      initLonnISykefravaeret(lonnISykefravaeretGreier);
      const refusjonEndringer = skjemaData.refusjon.refusjonEndringer;
      initRefusjonEndringer(
        refusjonEndringer
          ? refusjonEndringer
              ?.filter((endring) => endring && endring.beloep !== undefined)
              .map((endring) => ({ beloep: endring.beloep, dato: endring.dato }))
          : []
      );

      if (!!skjemaData.refusjon.kravetOpphoerer) {
        initRefusjonskravetOpphoerer(
          skjemaData.refusjon.kravetOpphoerer as YesNo,
          skjemaData.refusjon.refusjonOpphoerer,
          skjemaData.refusjon.harEndringer as YesNo
        );
      }
      setInnsenderTelefon(skjemaData.telefon);

      if (skjemaData.refusjon.kravetOpphoerer)
        refusjonskravetOpphoererStatus(skjemaData.refusjon.kravetOpphoerer as YesNo);
      if (skjemaData.refusjon.refusjonOpphoerer) refusjonskravetOpphoererDato(skjemaData.refusjon.refusjonOpphoerer);
      setHarRefusjonEndringer(skjemaData.refusjon.harEndringer as YesNo);

      if (skjemaData.inntekt.beloep) {
        setBareNyMaanedsinntekt(skjemaData.inntekt.beloep.toString());
      }
      setEndringsaarsak(skjemaData.inntekt.endringAarsak?.aarsak ?? '');

      switch (skjemaData.inntekt.endringAarsak?.aarsak) {
        case begrunnelseEndringBruttoinntekt.Tariffendring:
          setTariffEndringsdato(parseIsoDate(skjemaData.inntekt.endringAarsak.gjelderFra));
          setTariffKjentdato(parseIsoDate(skjemaData.inntekt.endringAarsak.gjelderFra));
          break;
        case begrunnelseEndringBruttoinntekt.Ferie: {
          const datoPerioder: Periode[] = mapEndringsAarsakPeriodeTilPeriode(skjemaData);
          setFeriePeriode(datoPerioder);
          break;
        }
        case begrunnelseEndringBruttoinntekt.VarigLoennsendring:
          setLonnsendringDato(parseIsoDate(skjemaData.inntekt.endringAarsak.gjelderFra));
          break;
        case begrunnelseEndringBruttoinntekt.Permisjon: {
          const datoPerioder: Periode[] = mapEndringsAarsakPeriodeTilPeriode(skjemaData);
          setPermisjonPeriode(datoPerioder);
          break;
        }
        case begrunnelseEndringBruttoinntekt.Permittering: {
          const datoPerioder: Periode[] = mapEndringsAarsakPeriodeTilPeriode(skjemaData);
          setPermitteringPeriode(datoPerioder);
          break;
        }
        case begrunnelseEndringBruttoinntekt.NyStilling:
          setNyStillingDato(parseIsoDate(skjemaData.inntekt.endringAarsak.gjelderFra));
          break;
        case begrunnelseEndringBruttoinntekt.NyStillingsprosent:
          setNyStillingsprosentDato(parseIsoDate(skjemaData.inntekt.endringAarsak.gjelderFra));
          break;
        case begrunnelseEndringBruttoinntekt.Sykefravaer: {
          const datoPerioder: Periode[] = mapEndringsAarsakPeriodeTilPeriode(skjemaData);
          setSykefravaerPeriode(datoPerioder);
          break;
        }
        case begrunnelseEndringBruttoinntekt.Feilregistrert:
        case begrunnelseEndringBruttoinntekt.Bonus:
        case begrunnelseEndringBruttoinntekt.Nyansatt:
        case begrunnelseEndringBruttoinntekt.Ferietrekk:
        default:
          // Fall gjennom uten å gjøre noe
          break;
      }

      setSenderInn(false);
    });
  };

  const changeMaanedsintektHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setBareNyMaanedsinntekt(event.target.value);
  };

  const changeBegrunnelseHandler = (verdi: string) => {
    logEvent('filtervalg', {
      tittel: 'Endringsårsak beregnet månedsinntekt',
      component: amplitudeComponent,
      kategori: verdi,
      filternavn: 'Endringsårsak beregnet månedsinntekt'
    });

    setEndringsaarsak(verdi);
  };

  useEffect(() => {
    if (aapentManglendeData) {
      setEndringerAvRefusjon('Ja');
    }
  }, [aapentManglendeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const sisteInnsending = gammeltSkjaeringstidspunkt ? formatDate(gammeltSkjaeringstidspunkt) : 'forrige innsending';
  const kanIkkeTilbakestilles = !kanBruttoinntektTilbakebestilles();

  const harEndringer = harRefusjonEndringer;

  const kreverIkkeRefusjon = nyInnsending
    ? gammeltSkjaeringstidspunkt &&
      opprinneligRefusjonEndringer?.filter((endring) => {
        return gammeltSkjaeringstidspunkt !== endring.dato && endring.beloep !== 0;
      }).length === 0
    : lonnISykefravaeret?.status === 'Nei' || !lonnISykefravaeret;

  const refusjonOpphoerer = !!forespurtData?.refusjon.forslag?.opphoersdato;
  let refusjonBeloep = refusjonPrMnd;

  if (
    refusjonOpphoerer &&
    isBefore(parseIsoDate(forespurtData?.refusjon.forslag?.opphoersdato!), gammeltSkjaeringstidspunkt!)
  ) {
    refusjonBeloep = 0;
  }

  const feilmeldinger = mapErrorsObjectToFeilmeldinger(errors);
  useEffect(() => {
    if (harEndringBruttoloenn === 'Nei') {
      unregister('inntekt.endringAarsak');
    }
  }, [harEndringBruttoloenn, unregister, register]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <div>
        <PageContent title='Oppdatert informasjon - innsendt inntektsmelding'>
          <main className={`main-content`}>
            <FormProvider {...methods}>
              <form className={styles.padded} onSubmit={methods.handleSubmit(submitForm)}>
                <PersonData erDelvisInnsending />
                <Skillelinje />
                <Heading2>Beregnet månedslønn</Heading2>
                {ukjentInntekt && (
                  <BodyLong>
                    Vi har ikke data fra den siste inntektsmeldingen, derfor må dere angi beregnet månedslønn manuelt.
                  </BodyLong>
                )}
                {!ukjentInntekt && (
                  <>
                    <BodyLong>
                      I henhold til siste inntektsmelding hadde den ansatte beregnet månedslønn på{' '}
                      <strong>{formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)}</strong>&nbsp;kr
                    </BodyLong>
                    <FancyJaNei
                      legend={`Har det vært endringer i beregnet månedslønn for den ansatte mellom ${sisteInnsending} og ${formatDate(
                        forsteFravaersdag
                      )} (start av nytt sykefravær)?`}
                      name='inntekt.endringBruttoloenn'
                    />
                  </>
                )}
                {((harEndringBruttoloenn === 'Ja' && !ukjentInntekt) || ukjentInntekt) && (
                  <div>
                    <BodyLong>Angi ny beregnet månedslønn per {formatDate(forsteFravaersdag)}</BodyLong>

                    <div className={lokalStyles.beloepwrapper}>
                      <VelgAarsak
                        changeMaanedsintektHandler={changeMaanedsintektHandler}
                        changeBegrunnelseHandler={changeBegrunnelseHandler}
                        tariffendringDato={tariffendringDato}
                        tariffkjentdato={tariffkjentdato}
                        ferie={ferie}
                        permisjon={permisjon}
                        permittering={permittering}
                        nystillingdato={nystillingdato}
                        nystillingsprosentdato={nystillingsprosentdato}
                        lonnsendringsdato={lonnsendringsdato}
                        sykefravaerperioder={sykefravaerperioder}
                        bestemmendeFravaersdag={forsteFravaersdag}
                        nyInnsending={nyInnsending}
                        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
                        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
                        sammeSomSist={ukjentInntekt}
                      />
                    </div>
                  </div>
                )}
                <Skillelinje />
                <Heading2>Refusjon</Heading2>
                {kreverIkkeRefusjon && (
                  <BodyLong>I henhold til siste inntektsmelding hadde dere ikke refusjonskrav.</BodyLong>
                )}

                {!kreverIkkeRefusjon && (
                  <>
                    <H3Label unPadded topPadded>
                      Refusjon til arbeidsgiver
                    </H3Label>
                    {!harEndringer && <BodyLong>Vi har ikke mottatt refusjonskrav for denne perioden.</BodyLong>}
                    {harEndringer && (
                      <>
                        {formatCurrency(refusjonBeloep || 0)} kr
                        {errors.refusjon?.refusjonPrMnd?.message && (
                          <div className='navds-form-field navds-form-field--medium navds-text-field--error endring-error-bottom-padded'>
                            <div
                              className='navds-form-field__error'
                              id='textField-error-refusjon-refusjonPrMnd'
                              aria-relevant='additions removals'
                              aria-live='polite'
                            >
                              <p className='navds-error-message navds-label' id='refusjon.refusjonPrMnd'>
                                {errors.refusjon?.refusjonPrMnd?.message}
                              </p>
                            </div>
                          </div>
                        )}
                        {refusjonEndringerUtenSkjaeringstidspunkt &&
                          refusjonEndringerUtenSkjaeringstidspunkt?.length === 0 && (
                            <>
                              <H3Label unPadded topPadded>
                                Er det endringer i refusjonskrav i perioden?
                              </H3Label>
                              Nei
                            </>
                          )}
                        {refusjonEndringerUtenSkjaeringstidspunkt &&
                          refusjonEndringerUtenSkjaeringstidspunkt?.length > 0 && (
                            <div className={lokalStyles.refusjonswrapper}>
                              <table>
                                <thead>
                                  <tr>
                                    <th className={lokalStyles.table_header}>
                                      <strong>Endret refusjon</strong>
                                    </th>
                                    <th>
                                      <strong>Dato for endret refusjon</strong>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {aktiveRefusjonEndringer?.map((endring) => (
                                    <tr key={endring.dato?.toString()}>
                                      <td>{formatCurrency(endring.beloep)} kr</td>
                                      <td>{formatDate(endring.dato)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        {opprinneligRefusjonskravetOpphoerer?.status === 'Nei' && (
                          <>
                            <H3Label unPadded topPadded>
                              Opphører refusjonkravet under sykefraværet?
                            </H3Label>
                            {opprinneligRefusjonskravetOpphoerer?.status}
                          </>
                        )}
                        {opprinneligRefusjonskravetOpphoerer?.status === 'Ja' && (
                          <>
                            <H3Label unPadded topPadded>
                              Siste dag dere krever refusjon for
                            </H3Label>
                            {formatDate(opprinneligRefusjonskravetOpphoerer.opphoersdato)}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                <FancyJaNei
                  legend={`Er det endringer i refusjonskravet etter ${formatDate(
                    forsteFravaersdag
                  )} (start av nytt sykefravær)?`}
                  name='refusjon.erDetEndringRefusjon'
                />

                {harEndringRefusjon === 'Ja' && (
                  <>
                    {!aapentManglendeData && <Heading2>Angi de refusjonskravene som har blitt endret.</Heading2>}
                    <OrdinaryJaNei
                      legend='Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
                      name='refusjon.kreverRefusjon'
                    />

                    {arbeidsgiverKreverRefusjon === 'Ja' && (
                      <>
                        <RefusjonArbeidsgiverBeloep />

                        <EndringRefusjon
                          maxDate={refusjonskravetOpphoerer?.opphoersdato}
                          // minDate={arbeidsgiverperioder?.[arbeidsgiverperioder.length - 1].tom}
                        />
                        <OrdinaryJaNei legend='Opphører refusjonkravet i perioden?' name='refusjon.kravetOpphoerer' />
                        {skalRefusjonskravetOpphoere === 'Ja' && (
                          <div className={lokalStyles.beloepperiode}>
                            <DatoVelger
                              label='Angi siste dag dere krever refusjon for'
                              defaultSelected={refusjonskravetOpphoerer?.opphoersdato}
                              name='refusjon.refusjonOpphoerer'
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <ConfirmationPanel
                  className={styles.confirmationpanel}
                  label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                  id='bekreft-opplysninger'
                  error={errors.opplysningerBekreftet?.message as string}
                  {...register('opplysningerBekreftet')}
                ></ConfirmationPanel>
                <FeilListe skalViseFeilmeldinger={feilmeldinger.length > 0} feilmeldinger={feilmeldinger ?? []} />
                <div className={styles.outerbuttonwrapper}>
                  <div className={styles.buttonwrapper}>
                    <Button className={styles.sendbutton} loading={senderInn}>
                      Send
                    </Button>

                    <Link className={styles.lukkelenke} href={environment.minSideArbeidsgiver}>
                      Lukk
                    </Link>
                  </div>
                </div>
              </form>
            </FormProvider>
          </main>
          <IngenTilgang open={ingenTilgangOpen} handleCloseModal={() => setIngenTilgangOpen(false)} />
          <HentingAvDataFeilet open={skjemaFeilet} handleCloseModal={lukkHentingFeiletModal} />
        </PageContent>
      </div>
    </div>
  );
};

export default Endring;

function mapEndringsAarsakPeriodeTilPeriode(skjemaData: z.infer<any>): Periode[] {
  return skjemaData.inntekt.endringAarsak.perioder.map((periode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: periode.fom + '-' + periode.tom
  }));
}

export async function getServerSideProps(context: any) {
  const slug = context.query.slug;

  return {
    props: {
      slug
    }
  };
}
