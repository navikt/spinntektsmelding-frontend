import React, { useEffect, useReducer, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Datepicker } from '@navikt/ds-datepicker';
import { BodyLong, Button, Checkbox, ConfirmationPanel, Radio, RadioGroup, Select, TextField } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';
import Banner, { Organisasjon } from '../components/Banner/Banner';
import TextLabel from '../components/TextLabel/TextLabel';
import Heading3 from '../components/Heading3/Heading3';
import Skillelinje from '../components/Skillelinje/Skillelinje';
import LabelLabel from '../components/LabelLabel/LabelLabel';

import useSWR from 'swr';

import styles from '../styles/Home.module.css';
import '@navikt/ds-datepicker/lib/index.css';

import formReducer, { initialState } from '../state/formReducer';
import { YesNo } from '../state/state';

import ButtonSlette from '../components/ButtonSlette/ButtonSlette';
import Script from 'next/script';
import SelectNaturalytelser from '../components/SelectNaturalytelser/SelectNaturalytelser';

import useRoute from '../components/Banner/useRoute';

import Behandlingsdager from '../components/Behandlingsdager';
import Fravaersperiode from '../components/Fravaersperiode/Fravaersperiode';
import Egenmelding from '../components/Egenmelding';
import Bruttoinntekt from '../components/Bruttoinntekt/Bruttoinntekt';
import Arbeidsforhold from '../components/Arbeidsforhold/Arbeidsforhold';
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import submitInntektsmelding from '../utils/submitInntektsmelding';

const fetcher = (url: string) => fetch(url).then((data) => data.json());

const ARBEIDSGIVER_URL = '/api/arbeidsgivere';

const Home: NextPage = () => {
  const setRoute = useRoute();
  const { data, error } = useSWR(ARBEIDSGIVER_URL, fetcher);

  const [state, dispatch] = useReducer(formReducer, initialState);

  const [arbeidsgivere, setArbeidsgivere] = useState([]);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(state); // eslint-disable-line

    const errorStatus = submitInntektsmelding(state);

    console.log(errorStatus); // eslint-disable-line

    dispatch({
      type: 'submitForm'
    });
  };

  const changeOrgUnderenhet = (organisasjon: Organisasjon) => {
    dispatch({
      type: 'setOrganisasjonUnderenhet',
      payload: organisasjon
    });
  };

  const leggTilNaturalytelse = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({
      type: 'leggTilNaturalytelseRad'
    });

    event.preventDefault();
  };

  const clickNaturalytelse = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleNaturalytelser',
      payload: !!event.currentTarget.checked
    });
  };

  const clickTilbakestillFravaersperiode = (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => {
    event.preventDefault();

    dispatch({
      type: 'tilbakestillFravaersperiode',
      payload: arbeidsforholdId
    });
  };

  const clickBekreftKorrektInntekt = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleBekreftKorrektInntekt',
      payload: !!event.currentTarget.checked
    });
  };

  const clickSlettNaturalytelse = (event: React.MouseEvent<HTMLButtonElement>, elementId: string) => {
    dispatch({
      type: 'slettNaturalytelse',
      payload: elementId
    });

    event.preventDefault();
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleOpplysningerBekreftet',
      payload: !!event.currentTarget.checked
    });
  };

  const clickLeggTilEgenmeldingsperiode = (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => {
    dispatch({
      type: 'leggTilEgenmeldingsperiode',
      payload: arbeidsforholdId
    });

    event.preventDefault();
  };

  const clickSlettFravaersperiode = (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => {
    dispatch({
      type: 'slettFravaersperiode',
      payload: periodeId
    });

    event.preventDefault();
  };

  const clickLeggTilFravaersperiode = (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => {
    dispatch({
      type: 'leggTilFravaersperiode',
      payload: arbeidsforholdId
    });

    event.preventDefault();
  };

  const clickSlettEgenmeldingsperiode = (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => {
    dispatch({
      type: 'slettEgenmeldingsperiode',
      payload: periodeId
    });

    event.preventDefault();
  };

  const clickArbeidsgiverBetalerHeleEllerDeler = (
    event: React.MouseEvent<HTMLInputElement>,
    arbeidsforholdId: string
  ) => {
    dispatch({
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
      payload: { status: event.currentTarget.value as YesNo, arbeidsforholdId: arbeidsforholdId }
    });
  };

  const clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden = (
    event: React.MouseEvent<HTMLInputElement>,
    arbeidsforholdId: string
  ) => {
    dispatch({
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
      payload: { status: event.currentTarget.value as YesNo, arbeidsforholdId: arbeidsforholdId }
    });
  };

  const clickTilbakestillMaanedsinntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    dispatch({
      type: 'tilbakestillBruttoinntekt'
    });
  };

  const clickRefusjonskravetOpphoerer = (event: React.MouseEvent<HTMLInputElement>, arbeidsforholdId: string) => {
    dispatch({
      type: 'toggleRefusjonskravetOpphoerer',
      payload: { status: Boolean(event.currentTarget.value === 'Ja'), arbeidsforholdId: arbeidsforholdId }
    });
  };

  const setEgenmeldingFraDato = (dateValue: string, periodeId: string) => {
    dispatch({
      type: 'setEgenmeldingFraDato',
      payload: {
        periodeId,
        value: dateValue
      }
    });
  };

  const setEgenmeldingTilDato = (dateValue: string, periodeId: string) => {
    dispatch({
      type: 'setEgenmeldingTilDato',
      payload: {
        periodeId,
        value: dateValue
      }
    });
  };

  const changeNaturalytelseType = (event: React.ChangeEvent<HTMLSelectElement>, ytelseId: string) => {
    dispatch({
      type: 'setNaturalytelseType',
      payload: {
        ytelseId,
        value: event.target.value
      }
    });
  };

  const changeNaturalytelseVerdi = (event: React.ChangeEvent<HTMLInputElement>, ytelseId: string) => {
    dispatch({
      type: 'setNaturalytelseVerdi',
      payload: {
        ytelseId,
        value: event.target.value
      }
    });
  };

  const changeArbeidsgiverBetalerBelop = (event: React.ChangeEvent<HTMLInputElement>, arbeidsforholdId: string) => {
    dispatch({
      type: 'setArbeidsgiverBetalerBelop',
      payload: {
        arbeidsforholdId,
        value: event.target.value
      }
    });
  };

  const changeNaturalytelseDato = (dateValue: string, ytelseId: string) => {
    dispatch({
      type: 'setNaturalytelseDato',
      payload: {
        ytelseId,
        value: dateValue
      }
    });
  };

  const onChangeBegrunnelseRedusertUtbetaling = (
    event: React.ChangeEvent<HTMLSelectElement>,
    arbeidsforholdId: string
  ) => {
    dispatch({
      type: 'setBegrunnelseRedusertUtbetaling',
      payload: {
        arbeidsforholdId,
        value: event.target.value
      }
    });
  };

  const selectEndringsaarsak = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: 'setEndringsaarsakMaanedsinntekt',
      payload: event.target.value
    });
  };

  const setNyMaanedsinntekt = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'setOppdatertMaanedsinntekt',
      payload: event.target.value
    });
  };

  const setSykemeldingFraDato = (dateValue: string, periodeId: string, arbeidsforholdId: string) => {
    dispatch({
      type: 'setFravaersperiodeFraDato',
      payload: {
        periodeId,
        value: dateValue,
        arbeidsforholdId
      }
    });
  };

  const setSykemeldingTilDato = (dateValue: string, periodeId: string, arbeidsforholdId: string) => {
    dispatch({
      type: 'setFravaersperiodeTilDato',
      payload: {
        periodeId,
        value: dateValue,
        arbeidsforholdId
      }
    });
  };

  const setBehandlingsdager = (behandlingsdager?: Array<Date>) => {
    dispatch({
      type: 'setBehandlingsdager',
      payload: behandlingsdager
    });
  };

  const setRefusjonskravOpphoersdato = (dateValue: string, arbeidsforholdId: string) => {
    dispatch({
      type: 'setRefusjonskravOpphoersdato',
      payload: {
        value: dateValue,
        arbeidsforholdId
      }
    });
  };

  const onChangeArbeidsforhold = (value: any[]) => {
    dispatch({
      type: 'setArbeidsforhold',
      payload: value
    });
  };

  const setSammeFravarePaaArbeidsforhold = (event: React.ChangeEvent<HTMLInputElement>, arbeidsforholdId: string) => {
    dispatch({
      type: 'setSammeFravarePaaArbeidsforhold',
      payload: { arbeidsforholdId: arbeidsforholdId, set: !!event.currentTarget.checked }
    });
  };

  const clickEndreFravaersperiode = (event: React.MouseEvent<HTMLButtonElement>, _arbeidsforholdId: string) => {
    event.preventDefault();
    dispatch({
      type: 'endreFravaersperiode'
    });
  };

  useEffect(() => {
    fetch('/api/arbeidsgivere').then((mottattData) => {
      mottattData.json().then((jsonData) => {
        setArbeidsgivere(jsonData);
      });
    });
  }, []);

  useEffect(() => {
    fetch('/api/inntektsmelding').then((mottattData) => {
      mottattData.json().then((jsonData) => {
        dispatch({
          type: 'fyllFormdata',
          payload: jsonData
        });
        setRoute(jsonData.orgnrUnderenhet);
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>
        <Banner
          tittelMedUnderTittel={'Sykepenger'}
          altinnOrganisasjoner={arbeidsgivere}
          onOrganisasjonChange={changeOrgUnderenhet}
        />
        <PageContent title='Inntektsmelding'>
          <main className='main-content'>
            <form className={styles.padded} onSubmit={submitForm}>
              <p>
                For at vi skal utbetale riktig beløp i forbindelse med langvarig sykemelding må dere bekrefte, eller
                oppdatere opplysningene vi har i forbindelse med den ansatte, og sykefraværet.
              </p>
              <div className={styles.personinfowrapper}>
                <div className={styles.denansatte}>
                  <Heading3>Den ansatte</Heading3>
                  <div className={styles.arbeidsgiverwrapper}>
                    <div className={styles.virksomhetsnavnwrapper}>
                      <TextLabel>Navn</TextLabel>
                      <div className={styles.virksomhetsnavn}>{state.navn}</div>
                    </div>
                    <div className={styles.orgnrnavnwrapper}>
                      <TextLabel>Personnummer</TextLabel>
                      {state.identitetsnummer}
                    </div>
                  </div>
                </div>
                <div className={styles['size-resten']}>
                  <Heading3>Arbeidsgiveren</Heading3>
                  <div className={styles.arbeidsgiverwrapper}>
                    <div className={styles.virksomhetsnavnwrapper}>
                      <TextLabel>Virksomhetsnavn</TextLabel>
                      <div className={styles.virksomhetsnavn}>{state.virksomhetsnavn}</div>
                    </div>
                    <div className={styles.orgnrnavnwrapper}>
                      <TextLabel>Org.nr. for underenhet</TextLabel>
                      {state.orgnrUnderenhet}
                    </div>
                  </div>
                </div>
              </div>

              {state.arbeidsforhold && state.arbeidsforhold.length > 1 && (
                <>
                  <Skillelinje />
                  <Arbeidsforhold
                    arbeidsforhold={state.arbeidsforhold}
                    onChangeArbeidsforhold={onChangeArbeidsforhold}
                  />
                </>
              )}

              <Skillelinje />
              {state.behandlingsdager && (
                <Behandlingsdager periode={state.fravaersperiode[0]} onSelect={setBehandlingsdager} />
              )}

              {!state.behandlingsdager && (
                <Fravaersperiode
                  perioder={state.fravaersperiode}
                  arbeidsforhold={state.arbeidsforhold}
                  sammePeriodeForAlle={state.sammeFravaersperiode}
                  setSykemeldingFraDato={setSykemeldingFraDato}
                  setSykemeldingTilDato={setSykemeldingTilDato}
                  setSammeFravarePaaArbeidsforhold={setSammeFravarePaaArbeidsforhold}
                  clickLeggTilFravaersperiode={clickLeggTilFravaersperiode}
                  clickSlettFravaersperiode={clickSlettFravaersperiode}
                  clickTilbakestillFravaersperiode={clickTilbakestillFravaersperiode}
                  clickEndreFravaersperiode={clickEndreFravaersperiode}
                />
              )}

              {state.egenmeldingsperioder && (
                <>
                  <Skillelinje />
                  {state.arbeidsforhold && (
                    <Egenmelding
                      egenmeldingsperioder={state.egenmeldingsperioder}
                      arbeidsforhold={state.arbeidsforhold}
                      setEgenmeldingFraDato={setEgenmeldingFraDato}
                      setEgenmeldingTilDato={setEgenmeldingTilDato}
                      clickSlettEgenmeldingsperiode={clickSlettEgenmeldingsperiode}
                      clickLeggTilEgenmeldingsperiode={clickLeggTilEgenmeldingsperiode}
                    />
                  )}
                </>
              )}

              <Skillelinje />

              <Bruttoinntekt
                bruttoinntekt={state.bruttoinntekt}
                tidligereinntekt={state.tidligereinntekt}
                setNyMaanedsinntekt={setNyMaanedsinntekt}
                selectEndringsaarsak={selectEndringsaarsak}
                clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
                clickBekreftKorrektInntekt={clickBekreftKorrektInntekt}
              />

              <Skillelinje />

              <RefusjonArbeidsgiver
                clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden={
                  clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden
                }
                clickArbeidsgiverBetalerHeleEllerDeler={clickArbeidsgiverBetalerHeleEllerDeler}
                clickRefusjonskravetOpphoerer={clickRefusjonskravetOpphoerer}
                setRefusjonskravOpphoersdato={setRefusjonskravOpphoersdato}
                onChangeBegrunnelseRedusertUtbetaling={onChangeBegrunnelseRedusertUtbetaling}
                changeArbeidsgiverBetalerBelop={changeArbeidsgiverBetalerBelop}
                lonnISykefravaeret={state.lonnISykefravaeret}
                fullLonnIArbeidsgiverPerioden={state.fullLonnIArbeidsgiverPerioden}
                refusjonskravetOpphoerer={state.refusjonskravetOpphoerer}
                arbeidsforhold={state.arbeidsforhold}
              />

              <Skillelinje />
              <Heading3>Eventuelle naturalytelser (valgfri)</Heading3>
              <p>
                Har den ansatte noen naturalytelser som bortfaller ved sykemelding så må de angis, ellers vil den
                ansatte ikke bli tilgoderegnet disse. Hvis den ansatte fotsatt beholder eventuelle naturalyteleser, så
                trenger dere ikke gjøre noe.
              </p>
              <Checkbox
                value='Naturalytelser'
                // checked={state.naturalytelser && state.naturalytelser.length > 0}
                onClick={clickNaturalytelse}
              >
                Ansatt har naturalytelser som bortfaller ved sykemeldingen
              </Checkbox>
              {state.naturalytelser && (
                <table className={styles.tablenaturalytelse}>
                  <thead>
                    <th>Naturalytelse</th>
                    <th>Dato naturalytelse bortfaller</th>
                    <th>Verdi naturalytelse - kr/måned</th>
                    <th></th>
                  </thead>
                  <tbody>
                    {state.naturalytelser.map((element) => {
                      return (
                        <tr key={element.id}>
                          <td>
                            <SelectNaturalytelser onChangeYtelse={changeNaturalytelseType} elementId={element.id} />
                          </td>

                          <td className={styles.tddatepickernatural}>
                            <Datepicker
                              inputId={'naturalytele-input-fra-dato-' + element.id}
                              inputLabel='Dato naturalytelse bortfaller'
                              onChange={(dateString) => changeNaturalytelseDato(dateString, element.id)}
                              // value={dato}
                              locale={'nb'}
                            />
                          </td>
                          <td>
                            <TextField
                              label={''}
                              className={styles.fnr}
                              onChange={(event) => changeNaturalytelseVerdi(event, element.id)}
                            ></TextField>
                          </td>
                          <td>
                            <ButtonSlette
                              onClick={(event) => clickSlettNaturalytelse(event, element.id)}
                              title='Slett ytelse'
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <div className={styles.naturalytelserknapp}>
                    <Button
                      variant='secondary'
                      className={styles.legtilbutton}
                      onClick={(e) => leggTilNaturalytelse(e)}
                    >
                      Legg til naturalytelse
                    </Button>
                  </div>
                </table>
              )}
              <ConfirmationPanel
                checked={state.opplysningerBekreftet}
                onClick={clickOpplysningerBekreftet}
                label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
              >
                NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke
                er riktige eller fullstendige.
              </ConfirmationPanel>
              <Button className={styles.sendbutton}>Send</Button>
            </form>
          </main>
        </PageContent>
        <div id='decorator-env' data-src='https://www.nav.no/dekoratoren/env?context=arbeidsgiver'></div>
        <Script type='text/javascript' src='https://www.nav.no/dekoratoren/client.js'></Script>
      </div>
    </div>
  );
};

export default Home;
