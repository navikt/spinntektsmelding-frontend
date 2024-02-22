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
import TextLabel from '../../components/TextLabel';
import ButtonEndre from '../../components/ButtonEndre';
import useSendInnDelvisSkjema from '../../utils/useSendInnDelvisSkjema';
import { isAfter, isBefore, sub } from 'date-fns';
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
import { LonnISykefravaeret, YesNo } from '../../state/state';
import mapErrorsObjectToFeilmeldinger from '../../utils/mapErrorsObjectToFeilmeldinger';

const Endring: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  type Skjema = z.infer<typeof delvisInnsendingSchema>;
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const [setEndringerAvRefusjon, tilbakestillRefusjoner] = useBoundStore((state) => [
    state.setEndringerAvRefusjon,
    state.tilbakestillRefusjoner
  ]);

  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const tariffendringDato = useBoundStore((state) => state.tariffendringDato);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permittering = useBoundStore((state) => state.permittering);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);

  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);

  const [initRefusjonskravetOpphoerer] = useBoundStore((state) => [state.initRefusjonskravetOpphoerer]);

  const [initLonnISykefravaeret, initRefusjonEndringer, setInnsenderTelefon] = useBoundStore((state) => [
    state.initLonnISykefravaeret,
    state.initRefusjonEndringer,
    state.setInnsenderTelefon
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
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const aapentManglendeData = inngangFraKvittering || ukjentInntekt;

  const [innsenderTelefonNr] = useBoundStore((state) => [state.innsenderTelefonNr]);

  const amplitudeComponent = 'DelvisInnsending';

  const sendInnDelvisSkjema = useSendInnDelvisSkjema(setIngenTilgangOpen, amplitudeComponent);

  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);

  const hentKvitteringsdata = useHentKvitteringsdata();

  const refusjonEndringerUtenSkjaeringstidspunkt =
    skjaeringstidspunkt && refusjonEndringer
      ? refusjonEndringer?.filter((endring) => {
          if (!endring.dato) return false;
          return isAfter(endring.dato, skjaeringstidspunkt);
        })
      : refusjonEndringer;

  const refusjonPrMnd = !nyInnsending
    ? lonnISykefravaeret!.beloep
    : refusjonEndringer
        ?.filter((endring) => {
          if (!endring.dato) return false;
          return !isAfter(endring.dato, skjaeringstidspunkt);
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

  const refusjonOpphorsdato = !nyInnsending ? refusjonskravetOpphoerer?.opphoersdato : undefined;
  const refusjonOpphoererStaus = !nyInnsending ? refusjonskravetOpphoerer?.status : undefined;

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
        refusjonOpphoerer: refusjonOpphorsdato,
        kravetOpphoerer: refusjonOpphoererStaus,
        kreverRefusjon: refusjonPrMnd !== 0 ? 'Ja' : 'Nei'
      }
    }
  });

  const {
    register,
    watch,
    formState: { isDirty, errors }
  } = methods;

  const harEndringBruttoloenn = watch('endringBruttoloenn');

  const harEndringRefusjon = watch('refusjon.erDetEndringRefusjon');

  let skalRefusjonskravetOpphoere = watch('refusjon.kravetOpphoerer');

  const arbeidsgiverKreverRefusjon = watch('refusjon.kreverRefusjon');

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

      setEndreMaanedsinntekt(false);
      tilbakestillMaanedsinntekt();
    },
    [setEndreMaanedsinntekt, tilbakestillMaanedsinntekt]
  );

  const setEndreMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setEndreMaanedsinntekt(true);
  };

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

  const submitForm: SubmitHandler<Skjema> = (skjemaData: Skjema) => {
    console.log('submitForm', skjemaData);

    setSenderInn(true);

    sendInnDelvisSkjema(true, pathSlug, isDirty, skjemaData).finally(() => {
      const lonnISykefravaeret: LonnISykefravaeret = {
        beloep: skjemaData.refusjon.refusjonPrMnd,
        status: skjemaData.refusjon.kreverRefusjon
      };

      initLonnISykefravaeret(lonnISykefravaeret);
      initRefusjonEndringer(
        skjemaData.refusjon.refusjonEndringer
          ? skjemaData.refusjon.refusjonEndringer
              ?.filter((endring) => endring && endring.beloep !== undefined)
              .map((endring) => ({ beloep: endring.beloep, dato: endring.dato }))
          : []
      );
      setInnsenderTelefon(skjemaData.telefon);

      initRefusjonskravetOpphoerer(
        skjemaData.refusjon.kravetOpphoerer as YesNo,
        skjemaData.refusjon.refusjonOpphoerer,
        skjemaData.refusjon.harEndringer as YesNo
      );

      setNyMaanedsinntekt(skjemaData.inntekt.beloep ? skjemaData.inntekt.beloep?.toString() : '');
      setEndringsaarsak(skjemaData.inntekt.endringAarsak?.aarsak ?? '');
      // oppdaterRefusjonEndringer(skjemaData.refusjon.refusjonEndringer ?? []);

      setSenderInn(false);
    });
  };

  const changeMaanedsintektHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNyMaanedsinntekt(event.target.value);
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
  let refusjonBelop = refusjonPrMnd;

  if (
    refusjonOpphoerer &&
    isBefore(parseIsoDate(forespurtData?.refusjon.forslag?.opphoersdato!), gammeltSkjaeringstidspunkt!)
  ) {
    refusjonBelop = 0;
  }

  const feilmeldinger = mapErrorsObjectToFeilmeldinger(errors);

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
                {!ukjentInntekt && !aapentManglendeData && (
                  <>
                    <BodyLong>
                      I henhold til siste inntektsmelding hadde den ansatte beregnet månedslønn på{' '}
                      <strong>{formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)}</strong> kr
                    </BodyLong>
                    <FancyJaNei
                      legend={`Har det vært endringer i beregnet månedslønn for den ansatte mellom ${sisteInnsending} og ${formatDate(
                        forsteFravaersdag
                      )} (start av nytt sykefravær)?`}
                      name='endringBruttoloenn'
                    />
                  </>
                )}
                {((harEndringBruttoloenn === 'Ja' && !ukjentInntekt) || ukjentInntekt) && (
                  <div>
                    <BodyLong>Angi ny beregnet månedslønn per {formatDate(forsteFravaersdag)}</BodyLong>

                    <div className={lokalStyles.beloepwrapper}>
                      {/* {!bruttoinntekt?.manueltKorrigert && !endreMaanedsinntekt && (
                        <>
                          <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-beloep'>
                            {formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)} kr/måned
                          </TextLabel>
                          <ButtonEndre data-cy='endre-beloep' onClick={setEndreMaanedsinntektHandler} />
                        </>
                      )}

                      {(bruttoinntekt?.manueltKorrigert || endreMaanedsinntekt) && ( */}
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
                      />
                      {/* )} */}
                    </div>
                  </div>
                )}
                <Skillelinje />
                <Heading2>Refusjon</Heading2>
                {kreverIkkeRefusjon && (
                  <BodyLong>I henhold til siste inntektsmelding hadde dere ikke refusjonskrav.</BodyLong>
                )}
                {!aapentManglendeData && (
                  <>
                    {!kreverIkkeRefusjon && (
                      <>
                        <H3Label unPadded topPadded>
                          Refusjon til arbeidsgiver
                        </H3Label>
                        {!harEndringer && <BodyLong>Vi har ikke mottatt refusjonskrav for denne perioden.</BodyLong>}
                        {harEndringer && (
                          <>
                            {formatCurrency(refusjonBelop || 0)} kr
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
                    {!aapentManglendeData && (
                      <FancyJaNei
                        legend={`Er det endringer i refusjonskravet etter ${formatDate(
                          forsteFravaersdag
                        )} (start av nytt sykefravær)?`}
                        name='refusjon.erDetEndringRefusjon'
                      />
                    )}
                  </>
                )}
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

export async function getServerSideProps(context: any) {
  const slug = context.query.slug;

  return {
    props: {
      slug
    }
  };
}
