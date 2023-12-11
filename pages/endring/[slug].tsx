import { BodyLong, Button, ConfirmationPanel, Link, Radio, RadioGroup } from '@navikt/ds-react';
import { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import formatCurrency from '../../utils/formatCurrency';
import useBoundStore from '../../state/useBoundStore';
import Feilsammendrag from '../../components/Feilsammendrag';
import feiltekster from '../../utils/feiltekster';
import lokalStyles from './Endring.module.css';
import Datovelger from '../../components/Datovelger';
import classNames from 'classnames/bind';
import Person from '../../components/Person/Person';
import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Heading2 from '../../components/Heading2/Heading2';
import H3Label from '../../components/H3Label';
import RefusjonArbeidsgiverBelop from '../../components/RefusjonArbeidsgiver/RefusjonArbeidsgiverBelop';
import { YesNo } from '../../state/state';
import { useSearchParams } from 'next/navigation';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
import logEvent from '../../utils/logEvent';
import environment from '../../config/environment';
import RefusjonUtbetalingEndring from '../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import IngenTilgang from '../../components/IngenTilgang';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';
import Aarsaksvelger from '../../components/Bruttoinntekt/Aarsaksvelger';
import TextLabel from '../../components/TextLabel';
import ButtonEndre from '../../components/ButtonEndre';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import Naturalytelser from '../../components/Naturalytelser';

const Endring: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [endringBruttolonn, setEndringBruttolonn] = useBoundStore((state) => [
    state.endringBruttolonn,
    state.setEndringBruttolonn
  ]);
  const [endringerAvRefusjon, setEndringerAvRefusjon, tilbakestillRefusjoner] = useBoundStore((state) => [
    state.endringerAvRefusjon,
    state.setEndringerAvRefusjon,
    state.tilbakestillRefusjoner
  ]);

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const setFeriePeriode = useBoundStore((state) => state.setFeriePeriode);
  const ferie = useBoundStore((state) => state.ferie);
  const setLonnsendringDato = useBoundStore((state) => state.setLonnsendringDato);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const setTariffEndringsdato = useBoundStore((state) => state.setTariffEndringsdato);
  const setTariffKjentdato = useBoundStore((state) => state.setTariffKjentdato);
  const tariffendringsdato = useBoundStore((state) => state.tariffendringsdato);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const setNyStillingDato = useBoundStore((state) => state.setNyStillingDato);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const setNyStillingsprosentDato = useBoundStore((state) => state.setNyStillingsprosentDato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const setPermisjonPeriode = useBoundStore((state) => state.setPermisjonPeriode);
  const permisjon = useBoundStore((state) => state.permisjon);
  const setPermitteringPeriode = useBoundStore((state) => state.setPermitteringPeriode);
  const permittering = useBoundStore((state) => state.permittering);
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);

  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const opprinneligLonnISykefravaeret = useBoundStore((state) => state.opprinneligLonnISykefravaeret);
  const beloepArbeidsgiverBetalerISykefravaeret = useBoundStore(
    (state) => state.beloepArbeidsgiverBetalerISykefravaeret
  );
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);

  const searchParams = useSearchParams();

  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const ukjentInntekt = useBoundStore((state) => state.ukjentInntekt);
  const arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret = useBoundStore(
    (state) => state.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret
  );
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);
  const setSykefravaerPeriode = useBoundStore((state) => state.setSykefravaerPeriode);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const kanBruttoinntektTilbakebestilles = useBoundStore((state) => state.kanBruttoinntektTilbakebestilles);
  const [opprinneligRefusjonEndringer, opprinneligRefusjonskravetOpphoerer, harRefusjonEndringer] = useBoundStore(
    (state) => [
      state.opprinneligRefusjonEndringer,
      state.opprinneligRefusjonskravetOpphoerer,
      state.harRefusjonEndringer
    ]
  );
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);
  const amplitudeComponent = 'DelvisInnsending';

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen);

  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);

  const hentKvitteringsdata = useHentKvitteringsdata();

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

  const setEndreMaanedsinntektHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      logEvent('knapp klikket', {
        tittel: 'Endre beregnet månedsinntekt',
        component: amplitudeComponent
      });

      setEndreMaanedsinntekt(true);
    },
    [setEndreMaanedsinntekt]
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

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    setSenderInn(true);

    sendInnSkjema(opplysningerBekreftet, true, pathSlug, amplitudeComponent).finally(() => {
      setSenderInn(false);
    });
  };

  const handleChangeEndringLonn = (value: string) => {
    setEndringBruttolonn(value as YesNo);
    slettFeilmelding('endring-bruttolonn');
    if (value === 'Nei') {
      setEndreMaanedsinntekt(false);
      tilbakestillMaanedsinntekt();
      logEvent('knapp klikket', {
        tittel: 'Tilbakestill beregnet månedsinntekt',
        component: amplitudeComponent
      });
    } else {
      setEndreMaanedsinntekt(true);
      logEvent('knapp klikket', {
        tittel: 'Endre beregnet månedsinntekt',
        component: amplitudeComponent
      });
    }
  };

  const handleChangeEndringRefusjon = (value: string) => {
    setEndringerAvRefusjon(value as YesNo);
    tilbakestillRefusjoner();
    slettFeilmelding('endring-refusjon');
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

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  useEffect(() => {
    if (inngangFraKvittering) {
      setEndringBruttolonn('Ja');
      setEndringerAvRefusjon('Ja');
    }
  }, [inngangFraKvittering]); // eslint-disable-line react-hooks/exhaustive-deps

  let cx = classNames.bind(lokalStyles);
  const classNameJa = cx({ fancyRadio: true, selectedRadio: endringBruttolonn === 'Ja' });
  const classNameNei = cx({ fancyRadio: true, selectedRadio: endringBruttolonn === 'Nei' });

  const classNameJaEndringAvRefusjon = cx({ fancyRadio: true, selectedRadio: endringerAvRefusjon === 'Ja' });
  const classNameNeiEndringAvRefusjon = cx({ fancyRadio: true, selectedRadio: endringerAvRefusjon === 'Nei' });

  const sisteInnsending = gammeltSkjaeringstidspunkt ? formatDate(gammeltSkjaeringstidspunkt) : 'forrrige innsending';
  const kanIkkeTilbakestilles = !kanBruttoinntektTilbakebestilles();

  const harEndringer = harRefusjonEndringer;

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
            <form className={styles.padded} onSubmit={submitForm}>
              <Person erDelvisInnsending />
              <Skillelinje />
              <Heading2>Beregnet månedslønn</Heading2>
              {ukjentInntekt && (
                <BodyLong>
                  Vi har ikke data fra den siste inntektsmeldingen, derfor må dere angi beregnet månedslønn manuelt.
                </BodyLong>
              )}
              {!ukjentInntekt && !inngangFraKvittering && (
                <>
                  <BodyLong>
                    I henhold til siste inntektsmelding hadde den ansatte beregnet månedslønn på{' '}
                    <strong>{formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)}</strong> kr
                  </BodyLong>
                  <RadioGroup
                    legend={`Har det vært endringer i beregnet månedslønn for den ansatte mellom ${sisteInnsending} og ${formatDate(
                      forsteFravaersdag
                    )} (start av nytt sykefravær)?`}
                    onChange={handleChangeEndringLonn}
                    className={lokalStyles.fancyRadioGruppe}
                    defaultValue={endringBruttolonn}
                    id='endring-bruttolonn'
                  >
                    <Radio value='Ja' className={classNameJa}>
                      Ja
                    </Radio>
                    <Radio value='Nei' className={classNameNei}>
                      Nei
                    </Radio>
                  </RadioGroup>
                </>
              )}
              {((endringBruttolonn === 'Ja' && !ukjentInntekt) || ukjentInntekt) && (
                <div>
                  <BodyLong>Angi ny beregnet månedslønn per {formatDate(forsteFravaersdag)}</BodyLong>

                  <div className={lokalStyles.belopwrapper}>
                    {!bruttoinntekt?.manueltKorrigert && !endreMaanedsinntekt && (
                      <>
                        <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-belop'>
                          {formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)} kr/måned
                        </TextLabel>
                        <ButtonEndre data-cy='endre-belop' onClick={setEndreMaanedsinntektHandler} />
                      </>
                    )}

                    {(bruttoinntekt?.manueltKorrigert || endreMaanedsinntekt) && (
                      <>
                        <Aarsaksvelger
                          bruttoinntekt={bruttoinntekt}
                          changeMaanedsintektHandler={changeMaanedsintektHandler}
                          changeBegrunnelseHandler={changeBegrunnelseHandler}
                          tariffendringsdato={tariffendringsdato}
                          tariffkjentdato={tariffkjentdato}
                          ferie={ferie}
                          permisjon={permisjon}
                          permittering={permittering}
                          nystillingdato={nystillingdato}
                          nystillingsprosentdato={nystillingsprosentdato}
                          lonnsendringsdato={lonnsendringsdato}
                          sykefravaerperioder={sykefravaerperioder}
                          setTariffEndringsdato={setTariffEndringsdato}
                          setTariffKjentdato={setTariffKjentdato}
                          setFeriePeriode={setFeriePeriode}
                          setLonnsendringDato={setLonnsendringDato}
                          setNyStillingDato={setNyStillingDato}
                          setNyStillingsprosentDato={setNyStillingsprosentDato}
                          setPermisjonPeriode={setPermisjonPeriode}
                          setPermitteringPeriode={setPermitteringPeriode}
                          setSykefravaerPeriode={setSykefravaerPeriode}
                          visFeilmeldingsTekst={visFeilmeldingsTekst}
                          bestemmendeFravaersdag={bestemmendeFravaersdag}
                          nyInnsending={nyInnsending}
                          clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
                          kanIkkeTilbakestilles={kanIkkeTilbakestilles}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
              <Skillelinje />
              <Heading2>Refusjon</Heading2>
              {!inngangFraKvittering && (
                <>
                  <BodyLong>I siste inntektsmelding hadde dere følgende refusjonskrav:</BodyLong>
                  <H3Label unPadded topPadded>
                    Refusjon til arbeidsgiver etter arbeidsgiverperiode
                  </H3Label>
                  {!harEndringer && <BodyLong>Vi har ikke mottatt refusjonskrav for denne perioden.</BodyLong>}
                  {harEndringer && (
                    <>
                      {formatCurrency(opprinneligLonnISykefravaeret?.belop || 0)} kr
                      <H3Label unPadded topPadded>
                        Er det endringer i refusjonskrav i perioden?
                      </H3Label>
                      {opprinneligRefusjonEndringer && opprinneligRefusjonEndringer?.length > 0 ? 'Ja' : 'Nei'}
                      {opprinneligRefusjonEndringer && opprinneligRefusjonEndringer?.length > 0 && (
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
                              {opprinneligRefusjonEndringer?.map((endring) => (
                                <tr key={endring.dato?.toString()}>
                                  <td>{formatCurrency(endring.belop)} kr</td>
                                  <td>{formatDate(endring.dato)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <H3Label unPadded topPadded>
                        Opphører refusjonkravet under sykefraværet?
                      </H3Label>
                      {opprinneligRefusjonskravetOpphoerer?.status}
                      {opprinneligRefusjonskravetOpphoerer?.status === 'Ja' && (
                        <>
                          <H3Label unPadded topPadded>
                            Siste dag dere krever refusjon for
                          </H3Label>
                          {formatDate(opprinneligRefusjonskravetOpphoerer.opphorsdato)}
                        </>
                      )}
                    </>
                  )}
                  {!inngangFraKvittering && (
                    <>
                      <RadioGroup
                        legend={`Har det vært endringer i refusjonskrav mellom ${sisteInnsending} og ${formatDate(
                          forsteFravaersdag
                        )} (start av nytt sykefravær)?`}
                        onChange={handleChangeEndringRefusjon}
                        className={lokalStyles.fancyRadioGruppe}
                        defaultValue={endringerAvRefusjon}
                        id='endring-refusjon'
                      >
                        <Radio value='Ja' className={classNameJaEndringAvRefusjon}>
                          Ja
                        </Radio>
                        <Radio value='Nei' className={classNameNeiEndringAvRefusjon}>
                          Nei
                        </Radio>
                      </RadioGroup>
                    </>
                  )}
                </>
              )}
              {endringerAvRefusjon === 'Ja' && (
                <>
                  {!inngangFraKvittering && <Heading2>Angi de refusjonskravene som har blitt endret.</Heading2>}
                  <RadioGroup
                    legend='Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
                    className={styles.radiobuttonwrapper}
                    id={'lus-radio'}
                    error={visFeilmeldingsTekst('lus-radio')}
                    onChange={arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret}
                    defaultValue={lonnISykefravaeret?.status}
                  >
                    <Radio value='Ja'>Ja</Radio>
                    <Radio value='Nei'>Nei</Radio>
                  </RadioGroup>
                  {lonnISykefravaeret?.status === 'Ja' && (
                    <>
                      <RefusjonArbeidsgiverBelop
                        visFeilmeldingsTekst={visFeilmeldingsTekst}
                        bruttoinntekt={lonnISykefravaeret?.belop || 0}
                        onOppdaterBelop={beloepArbeidsgiverBetalerISykefravaeret}
                      />

                      <RefusjonUtbetalingEndring
                        endringer={refusjonEndringer || []}
                        maxDate={refusjonskravetOpphoerer?.opphorsdato}
                        // minDate={arbeidsgiverperioder?.[arbeidsgiverperioder.length - 1].tom}
                        onHarEndringer={setHarRefusjonEndringer}
                        onOppdaterEndringer={oppdaterRefusjonEndringer}
                        harRefusjonEndring={harRefusjonEndringer}
                      />

                      <RadioGroup
                        legend='Opphører refusjonkravet i perioden?'
                        className={styles.radiobuttonwrapper}
                        id={'lus-sluttdato-velg'}
                        error={visFeilmeldingsTekst('lus-sluttdato-velg')}
                        onChange={refusjonskravetOpphoererStatus}
                        defaultValue={refusjonskravetOpphoerer?.status}
                      >
                        <Radio value='Ja' name='fullLonnIArbeidsgiverPerioden'>
                          Ja
                        </Radio>
                        <Radio value='Nei' name='fullLonnIArbeidsgiverPerioden'>
                          Nei
                        </Radio>
                      </RadioGroup>
                      {refusjonskravetOpphoerer?.status && refusjonskravetOpphoerer?.status === 'Ja' && (
                        <div className={lokalStyles.belopperiode}>
                          <Datovelger
                            label='Angi siste dag dere krever refusjon for'
                            onDateChange={refusjonskravetOpphoererDato}
                            id={`lus-sluttdato`}
                            error={visFeilmeldingsTekst(`lus-sluttdato`)}
                            defaultSelected={refusjonskravetOpphoerer?.opphorsdato}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              <Skillelinje />
              <Naturalytelser />
              <ConfirmationPanel
                className={styles.confirmationpanel}
                checked={opplysningerBekreftet}
                onClick={clickOpplysningerBekreftet}
                label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                id='bekreft-opplysninger'
                error={visFeilmeldingsTekst('bekreft-opplysninger')}
              ></ConfirmationPanel>
              <Feilsammendrag />
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
