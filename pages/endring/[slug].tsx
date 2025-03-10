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
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
import logEvent from '../../utils/logEvent';
import environment from '../../config/environment';
import IngenTilgang from '../../components/IngenTilgang';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';
import useSendInnDelvisSkjema from '../../utils/useSendInnDelvisSkjema';
import { addDays, isAfter, isBefore } from 'date-fns';
import parseIsoDate from '../../utils/parseIsoDate';
import valideringDelvisInnsendingSchema from '../../schema/valideringDelvisInnsendingSchema';
import FancyJaNei from '../../components/FancyJaNei/FancyJaNei';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import RefusjonArbeidsgiverBeloep from '../../components/RefusjonArbeidsgiverBeloep/RefusjonArbeidsgiverBeloep';
import EndringRefusjon, { EndringsBeloep } from '../../components/EndringRefusjon/EndringRefusjon';
import DatoVelger from '../../components/DatoVelger/DatoVelger';
import PersonData from '../../components/PersonData/PersonData';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import { HistoriskInntekt, LonnISykefravaeret, YesNo } from '../../state/state';
import mapErrorsObjectToFeilmeldinger from '../../utils/mapErrorsObjectToFeilmeldinger';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import { TDateISODate } from '../../state/MottattData';
import TidligereInntekt from '../../components/Bruttoinntekt/TidligereInntekt';

const Endring: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  type Skjema = z.infer<typeof valideringDelvisInnsendingSchema>;
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const [setEndringerAvRefusjon] = useBoundStore((state) => [state.setEndringerAvRefusjon]);

  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const setBareNyMaanedsinntekt = useBoundStore((state) => state.setBareNyMaanedsinntekt);
  const setEndringAarsak = useBoundStore((state) => state.setEndringAarsak);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);

  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);

  const [
    initLonnISykefravaeret,
    initRefusjonEndringer,
    setInnsenderTelefon,
    refusjonskravetOpphoererDato,
    refusjonskravetOpphoererStatus,
    setHarRefusjonEndringer,
    initRefusjonskravetOpphoerer,
    feilmeldinger
  ] = useBoundStore((state) => [
    state.initLonnISykefravaeret,
    state.initRefusjonEndringer,
    state.setInnsenderTelefon,
    state.refusjonskravetOpphoererDato,
    state.refusjonskravetOpphoererStatus,
    state.setHarRefusjonEndringer,
    state.initRefusjonskravetOpphoerer,
    state.feilmeldinger
  ]);

  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const ukjentInntekt = useBoundStore((state) => state.ukjentInntekt);

  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);

  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const forespurtData = useBoundStore((state) => state.forespurtData);
  const [opprinneligRefusjonEndringer, opprinneligRefusjonskravetOpphoerer, harRefusjonEndringer] = useBoundStore(
    (state) => [
      state.opprinneligRefusjonEndringer,
      state.opprinneligRefusjonskravetOpphoerer,
      state.harRefusjonEndringer
    ]
  );
  const [bestemmendeFravaersdag, mottattBestemmendeFravaersdag, mottattEksternBestemmendeFravaersdag] = useBoundStore(
    (state) => [
      state.bestemmendeFravaersdag,
      state.mottattBestemmendeFravaersdag,
      state.mottattEksternBestemmendeFravaersdag
    ]
  );
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);

  const endringAarsak: EndringAarsak | undefined = useBoundStore((state) => state.bruttoinntekt.endringAarsak);

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
    ? (lonnISykefravaeret!.beloep ?? bruttoinntekt?.bruttoInntekt)
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
          if (a.dato && b.dato) {
            return a.dato < b.dato ? 1 : -1;
          }
          return 0;
        })[0]?.beloep;

  let aktiveRefusjonEndringer;
  if (nyInnsending) {
    aktiveRefusjonEndringer =
      refusjonEndringerUtenSkjaeringstidspunkt && refusjonEndringerUtenSkjaeringstidspunkt.length > 0
        ? refusjonEndringerUtenSkjaeringstidspunkt
        : [{ beloep: undefined, dato: undefined }];
  } else {
    aktiveRefusjonEndringer = refusjonEndringer;
  }

  const opprinneligRefusjonskravetOpphoererStatus = opprinneligRefusjonskravetOpphoerer?.status;
  const opprinneligRefusjonskravetOpphoererDato = opprinneligRefusjonskravetOpphoerer?.opphoersdato;

  const methods = useForm<Skjema>({
    resolver: zodResolver(valideringDelvisInnsendingSchema),
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

  const harIngenEndringBruttoloenn = watch('inntekt.ingenEndringBruttoloenn');

  const harEndringRefusjon = watch('refusjon.erDetEndringRefusjon');

  const skalRefusjonskravetOpphoere = watch('refusjon.kravetOpphoerer');

  const arbeidsgiverKreverRefusjon = watch('refusjon.kreverRefusjon');

  const nyeRefusjonEndringer = watch('refusjon.refusjonEndringer');

  useEffect(() => {
    if (refusjonPrMnd) {
      setValue('refusjon.refusjonPrMnd', refusjonPrMnd);
    }
  }, [refusjonPrMnd, setValue]);

  useEffect(() => {
    if (ukjentInntekt) {
      setValue('inntekt.ingenEndringBruttoloenn', 'Ja');
    }
  }, [ukjentInntekt, setValue]);

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt) {
      setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [bruttoinntekt.bruttoInntekt, setValue]);

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.saksoversiktUrl;
  };

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
    if (!fravaersperioder && slug) {
      hentKvitteringsdata(slug);
      setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    }
    if (slug) {
      setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const foersteFravaersdag = finnFoersteFravaersdag(
    foreslaattBestemmendeFravaersdag,
    mottattBestemmendeFravaersdag,
    mottattEksternBestemmendeFravaersdag
  );

  const sendInnDelvisSkjema = useSendInnDelvisSkjema(setIngenTilgangOpen, amplitudeComponent, setError);

  const submitForm: SubmitHandler<Skjema> = (skjemaData: Skjema) => {
    setSenderInn(true);

    if (skjemaData.inntekt.beloep) {
      setBareNyMaanedsinntekt(skjemaData.inntekt.beloep.toString());
    }

    sendInnDelvisSkjema(true, slug, isDirty, skjemaData).finally(() => {
      const lonnISykefravaeretGreier: LonnISykefravaeret = {
        beloep: skjemaData.refusjon.refusjonPrMnd,
        status: skjemaData.refusjon.kreverRefusjon
      };

      initLonnISykefravaeret(lonnISykefravaeretGreier);
      const refusjonEndringer = skjemaData.refusjon.refusjonEndringer;
      initRefusjonEndringer(
        refusjonEndringer
          ? refusjonEndringer
              ?.filter((endring) => endring?.beloep !== undefined)
              .map((endring) => ({ beloep: endring.beloep, dato: endring.dato }))
          : []
      );

      if (skjemaData.refusjon.kravetOpphoerer) {
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

      setEndringAarsak(skjemaData.inntekt.endringAarsak);

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

  const mappedeFeilmeldinger = mapErrorsObjectToFeilmeldinger(errors);

  feilmeldinger.forEach((feil) => {
    mappedeFeilmeldinger.push(feil);
  });

  const sisteMuligeSluttdatoRefusjon = finnTidligsteRefusjonOpphoersdato(
    foreslaattBestemmendeFravaersdag,
    mottattBestemmendeFravaersdag,
    mottattEksternBestemmendeFravaersdag,
    nyeRefusjonEndringer
  );

  useEffect(() => {
    if (harIngenEndringBruttoloenn === 'Nei') {
      unregister('inntekt.endringAarsak');
      setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [harIngenEndringBruttoloenn, unregister, setValue, bruttoinntekt.bruttoInntekt]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />
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
                    Vi har ikke data fra den siste inntektsmeldingen, derfor må du angi beregnet månedslønn manuelt.
                  </BodyLong>
                )}
                {!ukjentInntekt && (
                  <>
                    <BodyLong>
                      Med utgangspunkt i inntekt rapportert i A-meldingen, hadde den ansatte en estimert beregnet
                      månedslønn per {formatDate(foersteFravaersdag)} på{' '}
                      <strong>{formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)}</strong>&nbsp;kr
                    </BodyLong>
                    <FancyJaNei
                      legend={`Stemmer dette med inntekten ved ${formatDate(
                        foersteFravaersdag
                      )} (start av nytt sykefravær)?`}
                      name='inntekt.ingenEndringBruttoloenn'
                    />
                  </>
                )}
                {(harIngenEndringBruttoloenn === 'Nei' || ukjentInntekt) && (
                  <div>
                    {tidligereinntekt && (
                      <>
                        <BodyLong>Følgende lønnsopplysninger er hentet fra A-meldingen:</BodyLong>
                        <TidligereInntekt tidligereinntekt={tidligereinntekt} henterData={false} />
                      </>
                    )}
                    <BodyLong>Angi ny beregnet månedslønn per {formatDate(foersteFravaersdag)}</BodyLong>

                    <div className={lokalStyles.beloepwrapper}>
                      <VelgAarsak
                        changeMaanedsintektHandler={changeMaanedsintektHandler}
                        changeBegrunnelseHandler={changeBegrunnelseHandler}
                        defaultEndringAarsak={endringAarsak}
                        bestemmendeFravaersdag={foersteFravaersdag}
                        nyInnsending={nyInnsending}
                        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
                        kanIkkeTilbakestilles={true}
                        sammeSomSist={ukjentInntekt}
                      />
                    </div>
                  </div>
                )}
                <Skillelinje />
                <Heading2>Refusjon</Heading2>
                {kreverIkkeRefusjon && (
                  <BodyLong>I henhold til siste inntektsmelding hadde du ikke refusjonskrav.</BodyLong>
                )}

                {!kreverIkkeRefusjon && (
                  <>
                    <H3Label unPadded topPadded>
                      Refusjon til arbeidsgiver
                    </H3Label>
                    {!harEndringer && <BodyLong>Vi har ikke mottatt refusjonskrav for denne perioden.</BodyLong>}
                    {harEndringer && (
                      <>
                        {formatCurrency(refusjonBeloep ?? 0)} kr
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
                              Siste dag du krever refusjon for
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
                    foersteFravaersdag
                  )} (start av nytt sykefravær)?`}
                  name='refusjon.erDetEndringRefusjon'
                />

                {harEndringRefusjon === 'Ja' && (
                  <>
                    {!aapentManglendeData && <Heading2>Angi de refusjonskravene som har blitt endret.</Heading2>}
                    <OrdinaryJaNei
                      legend='Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
                      name='refusjon.kreverRefusjon'
                    />

                    {arbeidsgiverKreverRefusjon === 'Ja' && (
                      <>
                        <RefusjonArbeidsgiverBeloep />

                        <EndringRefusjon
                          maxDate={refusjonskravetOpphoerer?.opphoersdato}
                          minDate={foersteFravaersdag}
                        />
                        <OrdinaryJaNei legend='Opphører refusjonkravet i perioden?' name='refusjon.kravetOpphoerer' />
                        {skalRefusjonskravetOpphoere === 'Ja' && (
                          <div className={lokalStyles.beloepperiode}>
                            <DatoVelger
                              label='Angi siste dag du krever refusjon for'
                              defaultSelected={refusjonskravetOpphoerer?.opphoersdato}
                              name='refusjon.refusjonOpphoerer'
                              fromDate={sisteMuligeSluttdatoRefusjon}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <ConfirmationPanel
                  className={styles.confirmationPanel}
                  label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                  id='bekreft-opplysninger'
                  error={errors.opplysningerBekreftet?.message as string}
                  {...register('opplysningerBekreftet')}
                ></ConfirmationPanel>
                <FeilListe
                  skalViseFeilmeldinger={mappedeFeilmeldinger.length > 0}
                  feilmeldinger={mappedeFeilmeldinger ?? []}
                />
                <div className={styles.outerButtonWrapper}>
                  <div className={styles.buttonWrapper}>
                    <Button className={styles.sendButton} loading={senderInn}>
                      Send
                    </Button>

                    <Link className={styles.lukkelenke} href={environment.saksoversiktUrl}>
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

export function finnFoersteFravaersdag(
  foreslaattBestemmendeFravaersdag: Date,
  mottattBestemmendeFravaersdag?: TDateISODate,
  mottattEksternBestemmendeFravaersdag?: TDateISODate
): Date {
  if (mottattBestemmendeFravaersdag) {
    if (
      mottattEksternBestemmendeFravaersdag &&
      isBefore(parseIsoDate(mottattEksternBestemmendeFravaersdag)!, parseIsoDate(mottattBestemmendeFravaersdag)!)
    ) {
      return parseIsoDate(mottattEksternBestemmendeFravaersdag)!;
    }
    return parseIsoDate(mottattBestemmendeFravaersdag)!;
  }
  return foreslaattBestemmendeFravaersdag;
}

function finnTidligsteRefusjonOpphoersdato(
  foreslaattBestemmendeFravaersdag: Date,
  mottattBestemmendeFravaersdag?: TDateISODate,
  mottattEksternBestemmendeFravaersdag?: TDateISODate,
  refusjonEndringer?: EndringsBeloep[]
): Date {
  let tidligsteOpphoersdato: Date = finnFoersteFravaersdag(
    foreslaattBestemmendeFravaersdag,
    mottattBestemmendeFravaersdag,
    mottattEksternBestemmendeFravaersdag
  );

  const refusjonEndringDatoer = refusjonEndringer?.map((endring) => endring.dato);
  const sisteEndringDato = refusjonEndringDatoer
    ?.filter((date): date is Date => date !== undefined)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const tidligsteMuligeEndringDato = sisteEndringDato ? addDays(sisteEndringDato, 1) : undefined;

  if (tidligsteMuligeEndringDato) {
    if (tidligsteOpphoersdato > tidligsteMuligeEndringDato) {
      return tidligsteOpphoersdato;
    } else {
      return tidligsteMuligeEndringDato;
    }
  } else {
    return tidligsteOpphoersdato;
  }
}

export async function getServerSideProps(context: any) {
  const slug = context.query.slug;

  return {
    props: {
      slug
    }
  };
}
