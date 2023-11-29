import { Alert, Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from './Initsiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { FormEvent, useState } from 'react';
import SelectArbeidsgiver from './SelectArbeidsgiver';
import FeilListe, { Feilmelding } from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import formatZodFeilmeldinger from '../../utils/formatZodFeilmeldinger';
import initsieringSkjema from './initsieringSkjema';

const Initsiering: NextPage = () => {
  const [organisasjonsnummer, setOrganisasjonsnummer] = useState<string>('');
  const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const [feilmeldinger, setFeilmeldinger] = useState<Feilmelding[] | undefined>(undefined);

  const onChangeArbeidsgiverSelect = (e: any) => {
    const organisasjonsnummerValidering = z.string();
    const verdi = organisasjonsnummerValidering.safeParse(e.target.value);
    const skjema = initsieringSkjema;

    if (verdi.success) {
      const organisasjonsnummer = verdi.data;
      setOrganisasjonsnummer(verdi.data);

      const skjemaData = {
        organisasjonsnummer: organisasjonsnummer,
        navn: 'navn',
        personnummer: identitetsnummer
      };

      const validationResult = skjema.safeParse(skjemaData);
      const tmpFeilmeldinger: Feilmelding[] = formatZodFeilmeldinger(validationResult);
      setFeilmeldinger(tmpFeilmeldinger);
    } else {
      setOrganisasjonsnummer('');
    }
  };

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    const skjema = initsieringSkjema;
    e.preventDefault();
    setVisFeilmeldinger(true);
    const skjemaData = {
      organisasjonsnummer: organisasjonsnummer,
      navn: 'navn',
      personnummer: identitetsnummer
    };

    const validationResult = skjema.safeParse(skjemaData);

    if (validationResult.success) {
      console.log('submitForm', validationResult);
      setFeilmeldinger(undefined);
    } else {
      console.log('validationResult', validationResult.error.format());

      const tmpFeilmeldinger: Feilmelding[] = formatZodFeilmeldinger(validationResult);
      setFeilmeldinger(tmpFeilmeldinger);
      setVisFeilmeldinger(true);
      console.log('feilmeldinger', tmpFeilmeldinger);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <PageContent title='Oppdatert informasjon - innsendt inntektsmelding'>
        <main className='main-content'>
          <div className={styles.padded}>
            <Heading1>Opprett inntektsmelding ifm. sykmelding</Heading1>
            <Alert variant='info'>
              Du vil normalt få et varsel når Nav trenger inntektsmelding. Vi sender ut varsel når arbeidsgiverperioden
              er ferdig og den sykmeldte har sendt inn søknad om sykepenger. Hvis du ikke fått denne oppgaven og du
              mener at du skal levere inntektsmelding så er det mulig å opprette den manuelt.
            </Alert>
            <form className={lokalStyles.form} onSubmit={submitForm}>
              <div className={lokalStyles.persondata}>
                <div className={lokalStyles.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p></p>
                </div>
                <div>
                  <TextLabel>Personnummer</TextLabel>
                  <p>{identitetsnummer}</p>
                </div>
              </div>
              <div>
                <div>
                  <SelectArbeidsgiver
                    onChangeArbeidsgiverSelect={onChangeArbeidsgiverSelect}
                    personnr={identitetsnummer}
                    skalViseFeilmeldinger={visFeilmeldinger}
                    feilmeldinger={feilmeldinger ?? []}
                    id='organisasjonsnummer'
                  />
                </div>
              </div>
              <div>
                <Button variant='tertiary' className={lokalStyles.primaryKnapp} onClick={() => history.back()}>
                  Tilbake
                </Button>
                <Button variant='primary' className={lokalStyles.primaryKnapp} disabled={organisasjonsnummer === ''}>
                  Neste
                </Button>
              </div>
            </form>
            <FeilListe skalViseFeilmeldinger={visFeilmeldinger} feilmeldinger={feilmeldinger ?? []} />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initsiering;
