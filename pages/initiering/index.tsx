import { Alert, Button, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import styles from '../../styles/Home.module.css';
import lokalStyles from './initiering.module.css';
import useBoundStore from '../../state/useBoundStore';

import FeilListe from '../../components/Feilsammendrag/FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';

const skjemaFnrSchema = z.object({
  identitetsnummer: PersonnummerSchema
});

const Initiering: NextPage = () => {
  type SkjemaFnr = z.infer<typeof skjemaFnrSchema>;
  const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(skjemaFnrSchema)
  });

  const router = useRouter();

  const submitForm: SubmitHandler<SkjemaFnr> = (skjemaData: SkjemaFnr) => {
    setIdentitetsnummer(skjemaData.identitetsnummer);
    router.push('/initiering2', { scroll: false });
  };

  const feilmeldinger = formatRHFFeilmeldinger(errors);
  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding sykepenger'} />
      <PageContent title='Inntektsmelding'>
        <main className='main-content'>
          <div className={styles.padded}>
            <Heading1>Opprett inntektsmelding for et sykefravær</Heading1>
            <Alert variant='info'>
              Du vil normalt få et varsel når Nav trenger inntektsmelding. Vi sender ut varsel når arbeidsgiverperioden
              er ferdig og den sykmeldte har sendt inn søknad om sykepenger. Hvis du ikke fått denne oppgaven og du
              mener at du skal levere inntektsmelding så er det mulig å opprette den manuelt.
            </Alert>
            <form className={lokalStyles.form} onSubmit={handleSubmit(submitForm)}>
              <TextField
                label='Angi personnummer for den ansatte'
                description='(ddmmååxxxxx)'
                className={lokalStyles.personnummer}
                {...register('identitetsnummer')}
                error={errors.identitetsnummer?.message as string}
              />
              <Button variant='primary' className={lokalStyles.primaryKnapp}>
                Neste
              </Button>
            </form>
            <FeilListe skalViseFeilmeldinger={feilmeldinger.length > 0} feilmeldinger={feilmeldinger ?? []} />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initiering;
