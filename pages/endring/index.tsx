import { BodyLong, Button, ConfirmationPanel, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
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
import Heading1 from '../../components/Heading1/Heading1';

const Endring: NextPage = () => {
  const [endringBruttolonn, setEndringBruttolonn] = useState<boolean | undefined>(undefined);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const [endringsaarsak, setEndringsaarsak] = useState<string>('');

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

  const [visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleChangeEndringLonn = (value: string) => {
    setEndringBruttolonn(value === 'Ja');
  };

  const changeMaanedsintektHandler = () => {};

  const changeBegrunnelseHandler = (verdi: string) => {
    setEndringsaarsak(verdi);
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (!!event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  const sisteInnsending = new Date();

  let cx = classNames.bind(lokalStyles);
  const classNameJa = cx({ fancyRadio: true, selectedRadio: endringBruttolonn });
  const classNameNei = cx({ fancyRadio: true, selectedRadio: endringBruttolonn !== undefined && !endringBruttolonn });
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
              <RadioGroup
                legend='I følge den siste inntektsmeldingen hadde den ansatte en lønn på 50000 kr dd.mm.åååå. Har det vært noen
              endringer i lønn for den ansatte mellom dd.mm.åååå og dd.mm.åååå?'
                onChange={handleChangeEndringLonn}
                className={lokalStyles.fancyRadioGruppe}
              >
                <Radio value='Ja' className={classNameJa}>
                  Ja
                </Radio>
                <Radio value='Nei' className={classNameNei}>
                  Nei
                </Radio>
              </RadioGroup>
              {endringBruttolonn && (
                <>
                  <Heading1>Brutto månedslønn</Heading1>
                  <BodyLong>Siste inntektsmelding ({formatDate(sisteInnsending)}) hadde den ansatte:</BodyLong>
                  <BodyLong>
                    Beregnet månedsinntekt:&nbsp;
                    {formatCurrency(bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0)} kr
                  </BodyLong>
                  <BodyLong>Angi ny månedslønn per dd.mm.ååååå</BodyLong>
                  <div className={biStyles.endremaaanedsinntektwrapper}>
                    <div className={biStyles.endremaaanedsinntekt}>
                      <TextField
                        label='Inntekt per måned'
                        onChange={changeMaanedsintektHandler}
                        defaultValue={formatCurrency(
                          bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
                        )}
                        id='inntekt.beregnetInntekt'
                        error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
                        className={biStyles.bruttoinntektendringsbelop}
                      />
                      <div>
                        <SelectEndringBruttoinntekt
                          onChangeBegrunnelse={changeBegrunnelseHandler}
                          error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
                          id='bruttoinntekt-endringsaarsak'
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
              {endringBruttolonn !== undefined && (
                <>
                  <ConfirmationPanel
                    className={styles.confirmationpanel}
                    checked={opplysningerBekreftet}
                    onClick={clickOpplysningerBekreftet}
                    label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
                    id='bekreft-opplysninger'
                    error={visFeilmeldingsTekst('bekreft-opplysninger')}
                  >
                    NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene
                    ikke er riktige eller fullstendige.
                  </ConfirmationPanel>
                  <Feilsammendrag />
                  <Button className={styles.sendbutton}>Send</Button>
                </>
              )}
            </form>
          </main>
        </PageContent>
      </div>
    </div>
  );
};

export default Endring;
