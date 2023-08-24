import { BodyLong, Button, ConfirmationPanel, Link, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import SelectEndringBruttoinntekt from '../../components/Bruttoinntekt/SelectEndringBruttoinntekt';
import PageContent from '../../components/PageContent/PageContent';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import biStyles from '../../components/Bruttoinntekt/Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import TariffendringDato from '../../components/Bruttoinntekt/TariffendringDato';
import useBoundStore from '../../state/useBoundStore';
import Feilsammendrag from '../../components/Feilsammendrag';
import feiltekster from '../../utils/feiltekster';
import lokalStyles from './Endring.module.css';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeListevelger from '../../components/Bruttoinntekt/PeriodeListevelger';
import Datovelger from '../../components/Datovelger';
import classNames from 'classnames/bind';
import Person from '../../components/Person/Person';
import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Heading2 from '../../components/Heading2/Heading2';
import H3Label from '../../components/H3Label';
import RefusjonArbeidsgiverBelop from '../../components/RefusjonArbeidsgiver/RefusjonArbeidsgiverBelop';
import { YesNo } from '../../state/state';
import { useRouter } from 'next/router';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
import useAmplitude from '../../utils/useAmplitude';
import environment from '../../config/environment';
import useValiderInntektsmelding from '../../utils/useValiderInntektsmelding';
import RefusjonUtbetalingEndring from '../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import useErrorRespons, { ErrorResponse } from '../../utils/useErrorResponse';
import useFyllInnsending, { InnsendingSkjema } from '../../state/useFyllInnsending';
import isValidUUID from '../../utils/isValidUUID';
import IngenTilgang from '../../components/IngenTilgang';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet';
import finnBestemmendeFravaersdag from '../../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../../utils/parseIsoDate';

const Endring: NextPage = () => {
  const [endringBruttolonn, setEndringBruttolonn] = useState<YesNo | undefined>();
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
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const endringsaarsak = useBoundStore((state) => state.bruttoinntekt.endringsaarsak);
  const setSlug = useBoundStore((state) => state.setSlug);
  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const beloepArbeidsgiverBetalerISykefravaeret = useBoundStore(
    (state) => state.beloepArbeidsgiverBetalerISykefravaeret
  );
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const validerInntektsmelding = useValiderInntektsmelding();
  const router = useRouter();
  const logEvent = useAmplitude();
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const fastsattInntekt = useBoundStore((state) => state.fastsattInntekt);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setSkjematype = useBoundStore((state) => state.setSkjematype);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const fyllInnsending = useFyllInnsending();
  const errorResponse = useErrorRespons();

  const [endringerAvRefusjon, setEndringerAvRefusjon] = useState<YesNo | undefined>();
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding, fyllFeilmeldinger] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding,
    state.fyllFeilmeldinger
  ]);

  const hentKvitteringsdata = useHentKvitteringsdata();

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.minSideArbeidsgiver;
  };

  useEffect(() => {
    if (!fravaersperioder && router.query.slug) {
      const slug = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
      hentKvitteringsdata(slug);
      setSkjematype(hentPaakrevdOpplysningstyper());
    }
    if (router.query.slug) {
      setSlug(router.query.slug);
      setSkjematype(hentPaakrevdOpplysningstyper());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.slug]);

  const pathSlug = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;

  const [forsteFravaersdag, setForsteFravaersdag] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fravaer = fravaersperioder?.concat(egenmeldingsperioder ?? []);
    if (!fravaer) return;

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(fravaer);

    if (bestemmendeFravaersdag) {
      setForsteFravaersdag(parseIsoDate(bestemmendeFravaersdag));
    }
  }, [fravaersperioder, egenmeldingsperioder]);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: 'BekreftInntektOgRefusjonSkjema'
    });

    const errorStatus = validerInntektsmelding(opplysningerBekreftet, true);

    if (!endringBruttolonn) {
      if (errorStatus.errorTexts === undefined) {
        errorStatus.errorTexts = [];
      }
      errorStatus.errorTexts.push({
        felt: 'endringBruttolonn',
        text: feiltekster.ENDRING_BRUTTOLOENN
      });
    }

    if (!endringerAvRefusjon) {
      if (errorStatus.errorTexts === undefined) {
        errorStatus.errorTexts = [];
      }
      errorStatus.errorTexts.push({
        felt: 'endringerAvRefusjon',
        text: feiltekster.ENDRINGER_AV_REFUSJON
      });
    }

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: 'BekreftInntektOgRefusjonSkjema'
      });
    } else {
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);

      fyllFeilmeldinger([]);
      setSenderInn(true);
      const postData = async () => {
        if (isValidUUID(pathSlug)) {
          const data = await fetch(`${environment.innsendingUrl}/${pathSlug}`, {
            method: 'POST',
            body: JSON.stringify(skjemaData),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          setSenderInn(false);

          switch (data.status) {
            case 201:
              setKvitteringInnsendt(new Date());
              router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
              break;

            case 500: {
              const errors: Array<ErrorResponse> = [
                {
                  value: 'Innsending av skjema feilet',
                  error: 'Innsending av skjema feilet',
                  property: 'server'
                }
              ];
              errorResponse(errors);

              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet - serverfeil',
                component: 'Hovedskjema'
              });

              break;
            }

            case 404: {
              const errors: Array<ErrorResponse> = [
                {
                  value: 'Innsending av skjema feilet',
                  error: 'Fant ikke endepunktet for innsending',
                  property: 'server'
                }
              ];
              errorResponse(errors);
              break;
            }

            case 401: {
              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet - ingen tilgang',
                component: 'Hovedskjema'
              });

              setIngenTilgangOpen(true);
              break;
            }

            default:
              const resultat = await data.json();

              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet',
                component: 'Hovedskjema'
              });

              if (resultat.errors) {
                const errors: Array<ErrorResponse> = resultat.errors;
                errorResponse(errors);
              }
          }
        } else {
          const errors: Array<ErrorResponse> = [
            {
              value: 'Innsending av skjema feilet',
              error: 'Innsending av skjema feilet. Ugyldig identifikator - ' + pathSlug,
              property: 'server'
            }
          ];

          logEvent('skjema validering feilet', {
            tittel: 'Ugyldig UUID ved innsending',
            component: 'Hovedskjema'
          });
          errorResponse(errors);
          setSenderInn(false);

          return false;
        }
      };
      postData();
    }
  };

  const handleChangeEndringLonn = (value: string) => {
    setEndringBruttolonn(value as YesNo);
    slettFeilmelding('endringBruttolonn');
  };

  const handleChangeEndringRefusjon = (value: string) => {
    setEndringerAvRefusjon(value as YesNo);
    slettFeilmelding('endringerAvRefusjon');
  };

  const changeMaanedsintektHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNyMaanedsinntekt(event.target.value);
  };

  const changeBegrunnelseHandler = (verdi: string) => {
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

  let cx = classNames.bind(lokalStyles);
  const classNameJa = cx({ fancyRadio: true, selectedRadio: endringBruttolonn === 'Ja' });
  const classNameNei = cx({ fancyRadio: true, selectedRadio: endringBruttolonn === 'Nei' });

  const classNameJaEndringAvRefusjon = cx({ fancyRadio: true, selectedRadio: endringerAvRefusjon === 'Ja' });
  const classNameNeiEndringAvRefusjon = cx({ fancyRadio: true, selectedRadio: endringerAvRefusjon === 'Nei' });

  const sisteInnsending = gammeltSkjaeringstidspunkt ? formatDate(gammeltSkjaeringstidspunkt) : 'forrrige innsending';

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
              <BodyLong>
                I henhold til siste inntektsmelding hadde den ansatte beregnet månedslønn på{' '}
                <strong>{formatCurrency(fastsattInntekt)}</strong> kr
              </BodyLong>
              <RadioGroup
                legend={`Har det vært endringer i beregnet månedslønn for den ansatte mellom ${sisteInnsending} og ${formatDate(
                  forsteFravaersdag
                )} (start av nytt sykefravær)?`}
                onChange={handleChangeEndringLonn}
                className={lokalStyles.fancyRadioGruppe}
                defaultValue={endringBruttolonn}
              >
                <Radio value='Ja' className={classNameJa}>
                  Ja
                </Radio>
                <Radio value='Nei' className={classNameNei}>
                  Nei
                </Radio>
              </RadioGroup>
              {endringBruttolonn === 'Ja' && (
                <>
                  <BodyLong>Angi ny beregnet månedslønn per {formatDate(forsteFravaersdag)}</BodyLong>

                  <div className={biStyles.endremaaanedsinntektwrapper}>
                    <div className={biStyles.endremaaanedsinntekt}>
                      <TextField
                        label='Ny beregnet månedslønn'
                        onChange={changeMaanedsintektHandler}
                        defaultValue={formatCurrency(bruttoinntekt?.bruttoInntekt ?? 0)}
                        id='inntekt.beregnetInntekt'
                        error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
                        className={biStyles.bruttoinntektendringsbelop}
                      />
                      <div>
                        <SelectEndringBruttoinntekt
                          onChangeBegrunnelse={changeBegrunnelseHandler}
                          error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
                          id='bruttoinntekt-endringsaarsak'
                          nyInnsending={false}
                          label='Forklaring til endring'
                        />
                      </div>
                    </div>
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
                      <div className={biStyles.endremaaanedsinntekt}>
                        <TariffendringDato
                          changeTariffEndretDato={setTariffEndringsdato}
                          changeTariffKjentDato={setTariffKjentdato}
                          defaultEndringsdato={tariffendringsdato}
                          defaultKjentDato={tariffkjentdato}
                        />
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.Ferie && (
                      <div className={biStyles.endremaaanedsinntekt}>
                        <div className={lokalStyles.endreperiodeliste}>
                          <PeriodeListevelger
                            onRangeListChange={setFeriePeriode}
                            defaultRange={ferie}
                            fomTekst='Fra'
                            tomTekst='Til'
                            fomIdBase='bruttoinntekt-ful-fom'
                            tomIdBase='bruttoinntekt-ful-tom'
                          />
                        </div>
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.VarigLonnsendring && (
                      <div className={lokalStyles.endremaaanedsinntekt}>
                        <Datovelger
                          onDateChange={setLonnsendringDato}
                          label='Lønnsendring gjelder fra'
                          id='bruttoinntekt-lonnsendring-fom'
                          defaultSelected={lonnsendringsdato}
                          toDate={bestemmendeFravaersdag}
                          error={visFeilmeldingsTekst('bruttoinntekt-lonnsendring-fom')}
                        />
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
                      <div className={lokalStyles.endreperiodeliste}>
                        <PeriodeListevelger
                          onRangeListChange={setPermisjonPeriode}
                          defaultRange={permisjon}
                          fomTekst='Fra'
                          tomTekst='Til'
                          fomIdBase='bruttoinntekt-permisjon-fom'
                          tomIdBase='bruttoinntekt-permisjon-tom'
                        />
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.Permittering && (
                      <div className={lokalStyles.endreperiodeliste}>
                        <PeriodeListevelger
                          onRangeListChange={setPermitteringPeriode}
                          defaultRange={permittering}
                          fomTekst='Fra'
                          tomTekst='Til'
                          fomIdBase='bruttoinntekt-permittering-fom'
                          tomIdBase='bruttoinntekt-permittering-tom'
                        />
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
                      <div className={lokalStyles.endremaaanedsinntekt}>
                        <Datovelger
                          onDateChange={setNyStillingDato}
                          label='Ny stilling fra'
                          id='bruttoinntekt-nystilling-fom'
                          defaultSelected={nystillingdato}
                          toDate={bestemmendeFravaersdag}
                        />
                      </div>
                    )}
                    {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
                      <div className={lokalStyles.endremaaanedsinntekt}>
                        <Datovelger
                          onDateChange={setNyStillingsprosentDato}
                          label='Ny stillingsprosent fra'
                          id='bruttoinntekt-nystillingsprosent-fom'
                          defaultSelected={nystillingsprosentdato}
                          toDate={bestemmendeFravaersdag}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              <Skillelinje />
              <Heading2>Refusjon</Heading2>
              <BodyLong>
                I siste inntektsmelding
                {gammeltSkjaeringstidspunkt && <> ({formatDate(gammeltSkjaeringstidspunkt)})</>} hadde dere følgende
                refusjonskrav:
              </BodyLong>
              <H3Label unPadded topPadded>
                Refusjon til arbeidsgiver etter arbeidsgiverperiode
              </H3Label>
              {lonnISykefravaeret?.status === 'Nei' && (
                <BodyLong>Vi har ikke mottatt refusjonskrav for denne perioden.</BodyLong>
              )}
              {lonnISykefravaeret?.status === 'Ja' && (
                <>
                  {formatCurrency(lonnISykefravaeret?.belop || 0)} kr
                  <H3Label unPadded topPadded>
                    Er det endringer i refusjonskrav i perioden?
                  </H3Label>
                  {harRefusjonEndringer}
                  {harRefusjonEndringer === 'Ja' && (
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
                          {refusjonEndringer?.map((endring) => (
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
                  {refusjonskravetOpphoerer?.status}
                  {refusjonskravetOpphoerer?.status === 'Ja' && (
                    <>
                      <H3Label unPadded topPadded>
                        Siste dag dere krever refusjon for
                      </H3Label>
                      {formatDate(refusjonskravetOpphoerer.opphorsdato)}
                    </>
                  )}
                </>
              )}
              <RadioGroup
                legend={`Har det vært endringer i refusjonskrav mellom ${sisteInnsending} og ${formatDate(
                  forsteFravaersdag
                )} (start av nytt sykefravær)?`}
                onChange={handleChangeEndringRefusjon}
                className={lokalStyles.fancyRadioGruppe}
                defaultValue={endringerAvRefusjon}
              >
                <Radio value='Ja' className={classNameJaEndringAvRefusjon}>
                  Ja
                </Radio>
                <Radio value='Nei' className={classNameNeiEndringAvRefusjon}>
                  Nei
                </Radio>
              </RadioGroup>
              {endringerAvRefusjon === 'Ja' && (
                <>
                  <Heading2>Angi de refusjonskravene som har blitt endret.</Heading2>
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
                        // fromDate={minDate}
                        // toDate={maxDate}
                        onDateChange={refusjonskravetOpphoererDato}
                        id={`lus-sluttdato`}
                        error={visFeilmeldingsTekst(`lus-sluttdato`)}
                        defaultSelected={refusjonskravetOpphoerer?.opphorsdato}
                      />
                    </div>
                  )}
                </>
              )}

              <ConfirmationPanel
                className={styles.confirmationpanel}
                checked={opplysningerBekreftet}
                onClick={clickOpplysningerBekreftet}
                label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                id='bekreft-opplysninger'
                error={visFeilmeldingsTekst('bekreft-opplysninger')}
              >
                NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke
                er riktige eller fullstendige.
              </ConfirmationPanel>
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
