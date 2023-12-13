import { Alert, Button, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import styles from '../../styles/Home.module.css';
import lokalStyles from './initiering.module.css';
import useBoundStore from '../../state/useBoundStore';
import { FormEvent, useState } from 'react';
import isFnrNumber from '../../utils/isFnrNumber';
import visFeilmeldingsTekst from '../../utils/visFeilmeldingsTekst';
import formatZodFeilmeldinger from '../../utils/formatZodFeilmeldinger';
import FeilListe, { Feilmelding } from '../../components/Feilsammendrag/FeilListe';

const Initiering: NextPage = () => {
  const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);
  const [fnr, setFnr] = useState<string>('');

  const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
  const [feilmeldinger, setFeilmeldinger] = useState<Feilmelding[] | undefined>(undefined);

  const router = useRouter();

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVisFeilmeldinger(true);
    const skjemaFnr = z
      .string()
      .transform((val) => val.replace(/\s/g, ''))
      .pipe(
        z
          .string()
          .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
          .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
      )
      .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer', path: ['identitetsnummer'] });
    const validertFnr = skjemaFnr.safeParse(fnr);

    if (validertFnr.success) {
      setFeilmeldinger(undefined);
      setIdentitetsnummer(validertFnr.data);
      router.push('/initiering2', { scroll: false });
    } else {
      const feilmeldinger = formatZodFeilmeldinger(validertFnr);

      setFeilmeldinger(feilmeldinger);
    }
  };

  const onChangeFnrInput = (e: any) => {
    setFnr(e.target.value);
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
              <TextField
                label='Angi personnummer for den ansatte'
                description='(ddmmååxxxxx)'
                className={lokalStyles.personnummer}
                onChange={onChangeFnrInput}
                error={visFeilmeldingsTekst('identitetsnummer', visFeilmeldinger, feilmeldinger)}
              />
              <Button variant='primary' className={lokalStyles.primaryKnapp}>
                Neste
              </Button>
            </form>
            <FeilListe skalViseFeilmeldinger={visFeilmeldinger} feilmeldinger={feilmeldinger ?? []} />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initiering;
