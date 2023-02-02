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
import FerieULonnDato from '../../components/Bruttoinntekt/FerieULonnDato';
import LonnsendringDato from '../../components/Bruttoinntekt/LonnsendringDato';
import useBoundStore from '../../state/useBoundStore';
import Feilsammendrag from '../../components/Feilsammendrag';
import feiltekster from '../../utils/feiltekster';
import lokalStyles from './Endring.module.css';

const Endring: NextPage = () => {
  const [endringBruttolonn, setEndringBruttolonn] = useState<boolean | undefined>(undefined);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const [endringsaarsak, setEndringsaarsak] = useState<string>('');

  const setFeriePeriode = useBoundStore((state) => state.setFeriePeriode);
  const ferieULonn = useBoundStore((state) => state.ferieULonn);
  const setLonnsendringDato = useBoundStore((state) => state.setLonnsendringDato);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const setTariffEndringsdato = useBoundStore((state) => state.setTariffEndringsdato);
  const setTariffKjentdato = useBoundStore((state) => state.setTariffKjentdato);
  const tariffendringsdato = useBoundStore((state) => state.tariffendringsdato);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

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
          <main className={`main-content`}></main>
          <form className={styles.padded} onSubmit={submitForm}>
            <RadioGroup
              legend='I følge den siste inntektsmeldingen hadde den ansatte en lønn på 50000 kr dd.mm.åååå. Har det vært noen
            endringer i lønn for den ansatte mellom dd.mm.åååå og dd.mm.åååå?'
              onChange={handleChangeEndringLonn}
            >
              <Radio value='Ja' className={lokalStyles.fancyRadio}>
                Ja
              </Radio>
              <Radio value='Nei' className={lokalStyles.fancyRadio}>
                Nei
              </Radio>
            </RadioGroup>
            {endringBruttolonn && (
              <>
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
                      id='bruttoinntekt-endringsbelop'
                      error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
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
                  {endringsaarsak === 'Tariffendring' && (
                    <div className={biStyles.endremaaanedsinntekt}>
                      <TariffendringDato
                        changeTariffEndretDato={setTariffEndringsdato}
                        changeTariffKjentDato={setTariffKjentdato}
                        defaultEndringsdato={tariffendringsdato}
                        defaultKjentDato={tariffkjentdato}
                      />
                    </div>
                  )}
                  {endringsaarsak === 'FerieUtenLonn' && (
                    <div className={biStyles.endremaaanedsinntekt}>
                      <FerieULonnDato onFerieRangeChange={setFeriePeriode} defaultRange={ferieULonn} />
                    </div>
                  )}
                  {endringsaarsak === 'Lonnsokning' && (
                    <div className={biStyles.endremaaanedsinntekt}>
                      <LonnsendringDato
                        onChangeLonnsendringsdato={setLonnsendringDato}
                        defaultDate={lonnsendringsdato}
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
        </PageContent>
      </div>
    </div>
  );
};

export default Endring;
