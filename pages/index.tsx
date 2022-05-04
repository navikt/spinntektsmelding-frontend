import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Checkbox, ConfirmationPanel, Ingress, Radio, RadioGroup, Select, TextField } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';
import Banner, { Organisasjon } from '../components/Banner/Banner';
import TextLabel from '../components/TextLabel/TextLabel';
import Heading3 from '../components/Heading3/Heading3';
import Skillelinje from '../components/Skillelinje/Skillelinje';
import LabelLabel from '../components/LabelLabel/LabelLabel';

import styles from '../styles/Home.module.css';
import '@navikt/ds-datepicker/lib/index.css';

import mockOrg from '../mockdata/testOrganisasjoner';
import formReducer, { initialState } from '../state/formReducer';
import { YesNo } from '../state/state';
import { useImmerReducer } from 'use-immer';
import ButtonSlette from '../components/ButtonSlette/ButtonSlette';
import BergnetMaanedsinntekt, {
  OppdatertMaanedsintekt
} from '../components/BeregnetMaanedsinntekt/BeregnetMaanedsinntekt';
import { SuccessStroke } from '@navikt/ds-icons';
import { element } from 'prop-types';

const Home: NextPage = () => {
  const [state, dispatch] = useImmerReducer(formReducer, initialState);

  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(state); // eslint-disable-line
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

  const clickLeggTilEgenmeldingsperiode = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({
      type: 'leggTilEgenmeldingsperiode'
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

  const clickLeggTilFravaersperiode = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({
      type: 'leggTilFravaersperiode'
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

  const clickArbeidsgiverBetalerHeleEllerDeler = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
      payload: event.currentTarget.value as YesNo
    });
  };

  const clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch({
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
      payload: event.currentTarget.value as YesNo
    });
  };

  const clickBekreftInntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    dispatch({
      type: 'visBekreftMaanedsinntekt'
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

  const changeNaturalytelseValue = (event: React.ChangeEvent<HTMLInputElement>, ytelseId: string) => {
    dispatch({
      type: 'setNaturalytelseVerdi',
      payload: {
        ytelseId,
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

  const closeBergnetMaanedsinntekt = (maanedsinntekt: OppdatertMaanedsintekt) => {
    dispatch({
      type: 'setOppdatertMaanedsinntekt',
      payload: maanedsinntekt
    });
  };

  const setSykemeldingFraDato = (dato: string) => {};

  const setSykemeldingTilDato = (dato: string) => {};

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
          altinnOrganisasjoner={mockOrg}
          onOrganisasjonChange={changeOrgUnderenhet}
        />
        <PageContent>
          <main className='main-content'>
            <Ingress className={styles.ingress}>
              For at vi skal utbetale riktig beløp i forbindelse med langvarig sykemelding må dere bekrefte, eller
              oppdatere opplysningene vi har i forbindelse med den ansatte, og sykefraværet.
            </Ingress>
            <form className={styles.padded} onSubmit={submitForm}>
              <div className={styles.personinfowrapper}>
                <div className={styles.size40}>
                  <Heading3>Den ansatte</Heading3>
                  <TextField label='Fødselsnummer 11 siffer' className={styles.fnr}></TextField>
                </div>
                <div className={styles['size-resten']}>
                  <Heading3>Arbeidsgiveren</Heading3>
                  <div className={styles.arbeidsgiverwrapper}>
                    <div className={styles.thirdsize}>
                      <TextLabel>Virksomhetsnavn</TextLabel>
                      <div className={styles.virksomhetsnavn}>{state.virksomhetsnavn}</div>
                    </div>
                    <div className={styles['size-resten']}>
                      <TextLabel>Organisasjonsnummer for underenhet</TextLabel>
                      {state.orgnrUnderenhet}
                    </div>
                  </div>
                </div>
              </div>
              <Skillelinje />
              <Heading3>Fraværsperiode</Heading3>
              <p>
                I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode
                dersom den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke
                ta med eventuelle egenmeldingsdager i dette steget.
              </p>
              {state.fravaersperiode.map((periode) => (
                <div className={styles.periodewrapper} key={periode.id}>
                  {!endreSykemelding && (
                    <div className={styles.datepickerescape}>
                      <TextLabel>Fra</TextLabel>
                      <div>07.10.2021</div>
                    </div>
                  )}
                  {endreSykemelding && (
                    <div className={styles.datepickerescape}>
                      <LabelLabel htmlFor='datepicker-egenmelding-fra' className={styles.datepickerlabel}>
                        Fra
                      </LabelLabel>
                      <Datepicker
                        inputLabel='Fra'
                        inputId='datepicker-egenmelding-fra'
                        onChange={(dateString) => setSykemeldingFraDato(dateString)}
                        locale={'nb'}
                      />
                    </div>
                  )}

                  {!endreSykemelding && (
                    <div className={styles.datepickerescape}>
                      <TextLabel>Til</TextLabel>
                      <div>24.10.2021</div>
                    </div>
                  )}
                  {endreSykemelding && (
                    <div className={styles.datepickerescape}>
                      <LabelLabel htmlFor='datepicker-egenmelding-til' className={styles.datepickerlabel}>
                        Til
                      </LabelLabel>
                      <Datepicker
                        inputLabel='Til'
                        inputId='datepicker-egenmelding-til'
                        onChange={(dateString) => setSykemeldingTilDato(dateString)}
                        locale={'nb'}
                      />
                    </div>
                  )}
                  <div className={styles.endresykemelding}>
                    {!endreSykemelding && (
                      <Button
                        variant='secondary'
                        className={styles.endrebutton}
                        onClick={() => setEndreSykemelding(!endreSykemelding)}
                      >
                        Endre
                      </Button>
                    )}
                    {endreSykemelding && state.fravaersperiode.length > 1 && (
                      <ButtonSlette
                        onClick={(event) => clickSlettFravaersperiode(event, periode.id)}
                        title='Slett fraværsperiode'
                      />
                    )}
                  </div>
                </div>
              ))}
              {endreSykemelding && (
                <div className={styles.endresykemeldingknapper}>
                  <Button variant='secondary' className={styles.kontrollerknapp} onClick={clickLeggTilFravaersperiode}>
                    Legg til periode
                  </Button>

                  <Button className={styles.kontrollerknapp} onClick={() => setEndreSykemelding(!endreSykemelding)}>
                    Tilbakestill
                  </Button>
                </div>
              )}
              <Skillelinje />
              <Heading3>Eventuell egenmelding (valgfri)</Heading3>
              <p>
                Dersom den ansatte var fraværende med egenmelding frem til sykmeldingen ble utstedt skal du oppgi første
                fraværsdag med egenmelding i dette feltet.
              </p>
              {state.egenmeldingsperioder &&
                state.egenmeldingsperioder.map((egenmeldingsperiode) => {
                  return (
                    <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
                      <div className={styles.datepickerescape}>
                        <LabelLabel htmlFor='datepicker-input-fra-dato' className={styles.datepickerlabel}>
                          Egenmelding fra dato
                        </LabelLabel>
                        <Datepicker
                          onChange={(dateString) => setEgenmeldingFraDato(dateString, egenmeldingsperiode.id)}
                          inputLabel='Egenmelding fra dato'
                        />
                      </div>
                      <div className={styles.datepickerescape}>
                        <LabelLabel htmlFor='datepicker-input-til-dato' className={styles.datepickerlabel}>
                          Egenmelding til dato
                        </LabelLabel>
                        <Datepicker
                          inputLabel='Egenmelding til dato'
                          inputId='datepicker-input-til-dato'
                          onChange={(dateString) => setEgenmeldingTilDato(dateString, egenmeldingsperiode.id)}
                          locale={'nb'}
                        />
                      </div>
                      <div className={styles.endresykemelding}>
                        <ButtonSlette
                          onClick={(event) => clickSlettEgenmeldingsperiode(event, egenmeldingsperiode.id)}
                          title='Slett egenmeldingsperiode'
                        />
                      </div>
                    </div>
                  );
                })}
              <div>
                <Button variant='secondary' className={styles.legtilbutton} onClick={clickLeggTilEgenmeldingsperiode}>
                  Legg til egenmeldingsperiode
                </Button>
              </div>
              <Skillelinje />
              <Heading3>Bruttoinntekt siste 3 måneder</Heading3>
              <p>
                Vi har brukt opplysninger fra skatteetaten (a-ordningen) for å anslå månedsinntekten her. Desom det ikke
                stemmer må dere endre dette. Dersom inntekten har gått opp pga. varig lønnsforhøyelse, og ikke for
                eksempel representerer uforutsett overtid må dette korrigeres.
              </p>
              <p>
                <strong>Vi har registrert en inntekt på</strong>
              </p>
              <div className={styles.belopwrapper}>
                <TextLabel className={styles.maanedsinntekt}>{state.bruttoinntekt?.bruttoInntekt} kr/måned</TextLabel>
                {!state.bruttoinntekt?.bekreftet && <TextLabel className={styles.noktekst}>Må kontrolleres</TextLabel>}
                {state.bruttoinntekt?.bekreftet && (
                  <TextLabel className={styles.oktekst}>
                    <SuccessStroke /> Bekreftet
                  </TextLabel>
                )}
                <Button variant='secondary' className={styles.kontrollerknapp} onClick={clickBekreftInntekt}>
                  Kontroller / Endre
                </Button>
              </div>
              <p>
                <strong>
                  Hvis beløpet ikke er korrekt må dere endre dette. Det kan være at den ansatte nylig har fått
                  lønnsøkning, bonus, redusering i arbeidstid eller har andre endringer i lønn som vi ikke registrert.
                  Beregningen er gjort etter <Link href='#'>folketrygdloven $8-28.</Link>
                </strong>
              </p>
              <Skillelinje />
              <Heading3>Refusjon til arbeidsgiver</Heading3>
              <p>
                Vi må vite om arbeidsgiver betaler ut lønn under sykemeldingsperioden til arbeidstakeren, eller om NAV
                skal betale ut sykepenger til den sykemeldte etter arbeidsgiverperioden.
              </p>
              <RadioGroup
                legend='Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?'
                className={styles.radiobuttonwrapper}
              >
                <Radio
                  value='Ja'
                  onClick={clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden}
                  name='fullLonnIArbeidsgiverPerioden'
                >
                  Ja
                </Radio>
                <Radio
                  value='Nei'
                  onClick={clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden}
                  name='fullLonnIArbeidsgiverPerioden'
                >
                  Nei
                </Radio>
              </RadioGroup>
              {state.fullLonnIArbeidsgiverPerioden?.status === 'Nei' && (
                <Select label='Velg begrunnelse for  ingen eller redusert utbetaling' className={styles.halfsize}>
                  <option value=''>Velg</option>
                </Select>
              )}
              <RadioGroup
                legend='Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?'
                className={styles.radiobuttonwrapper}
              >
                <Radio value='Ja' onClick={clickArbeidsgiverBetalerHeleEllerDeler}>
                  Ja
                </Radio>
                <Radio value='Nei' onClick={clickArbeidsgiverBetalerHeleEllerDeler}>
                  Nei
                </Radio>
              </RadioGroup>
              {state.betalerArbeidsgiverHeleEllerDeler?.status === 'Ja' && (
                <TextField label='Oppgi refusjonsbeløpet per måned' className={styles.halfsize} />
              )}
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
                    {state.naturalytelser.map((element, row) => {
                      return (
                        <tr key={element.id}>
                          <td>
                            <Select label={''} onChange={(event) => changeNaturalytelseType(event, element.id)}>
                              <option value=''>Velg naturalytelse</option>
                              <option value='ElektroniskKommunikasjon'>Elektronisk kommunikasjon</option>
                              <option value='Aksjeer'>Aksjer / grunnfondsbevis til underkurs</option>
                              <option value='Losji'>Losji</option>
                              <option value='KostDøgn'>Kost (døgn)</option>
                              <option value='Besøksreiser'>Besøksreiser i hjemmet annet</option>
                              <option value='Kostbesparelse'>Kostbesparelse i hjemmet</option>
                              <option value='Rentefordel'>Rentefordel lån</option>
                              <option value='Bil'>Bil</option>
                              <option value='KostDager'>Kost (dager)</option>
                              <option value='Bolig'>Bolig</option>
                              <option value='Forsikringer'>Skattepliktig del av visse forsikringer</option>
                              <option value='FriTransport'>Fri transport</option>
                              <option value='Opsjoner'>Opsjoner</option>
                              <option value='Barnehageplass'>Tilskudd barnehageplass</option>
                              <option value='YrkesbilKilometer'>Yrkesbil tjenestebehov kilometer</option>
                              <option value='YrkesbilListepris'>Yrkesbil tjenestebehov listepris</option>
                              <option value='UtenlandskPensjonsordning'>Innbetaling utenlandsk pensjonsordning</option>
                            </Select>
                          </td>

                          <td className={styles.tddatepickernatural}>
                            <Datepicker
                              inputId={'naturalytele-input-fra-dato-' + element}
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
                              onChange={(event) => changeNaturalytelseValue(event, element.id)}
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
            <BergnetMaanedsinntekt
              maanedsinntekt={state.bruttoinntekt?.bruttoInntekt || 0}
              maaned1navn={'Januar'}
              maaned2navn={'Februar'}
              maaned3navn={'Mars'}
              maaned1sum={50000}
              maaned2sum={23000}
              maaned3sum={50000}
              open={state.showBeregnetMaanedsinntektModal}
              onClose={closeBergnetMaanedsinntekt}
            />
          </main>
        </PageContent>
        <div id='decorator-env' data-src='https://www.nav.no/dekoratoren/env?context=arbeidsgiver'></div>
        <script type='text/javascript' src='https://www.nav.no/dekoratoren/client.js'></script>
      </div>
    </div>
  );
};

export default Home;
