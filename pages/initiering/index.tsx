import { Alert, Button, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
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
import VelgAarsak from './VelgAarsak';

const skjemaFnrSchema = z.object({
  identitetsnummer: PersonnummerSchema,
  aarsakInnsending: z.enum(['UnntattAARegisteret', 'Annet', 'Behandlingsdager'], {
    errorMap: () => ({ message: 'Du må velge en årsak til at du vil opprette inntektsmelding.' })
  })
});

const Initiering: NextPage = () => {
  type SkjemaFnr = z.infer<typeof skjemaFnrSchema>;
  const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);
  const setAarsakSelvbestemtInnsending = useBoundStore((state) => state.setAarsakSelvbestemtInnsending);

  const methods = useForm({
    resolver: zodResolver(skjemaFnrSchema)
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  const router = useRouter();

  const submitForm: SubmitHandler<SkjemaFnr> = (skjemaData: SkjemaFnr) => {
    setIdentitetsnummer(skjemaData.identitetsnummer);
    setAarsakSelvbestemtInnsending(skjemaData.aarsakInnsending);
    if (skjemaData.aarsakInnsending === 'UnntattAARegisteret') {
      router.push('/initieringFritatt', { scroll: false });
      return;
    }
    if (skjemaData.aarsakInnsending === 'Behandlingsdager') {
      router.push('/initieringBehandlingsdager', { scroll: false });
      return;
    }

    router.push('/initieringAnnet', { scroll: false });
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
            <FormProvider {...methods}>
              <form className={lokalStyles.form} onSubmit={handleSubmit(submitForm)}>
                <VelgAarsak legend='Årsak til at du vil opprette inntektsmelding.' name='aarsakInnsending' />
                <TextField
                  label='Ansattes fødselsnummer'
                  description='(ddmmååxxxxx)'
                  className={lokalStyles.personnummer}
                  {...register('identitetsnummer')}
                  error={errors.identitetsnummer?.message as string}
                />
                <Button variant='primary' className={lokalStyles.primaryKnapp}>
                  Neste
                </Button>
              </form>
            </FormProvider>
            <FeilListe skalViseFeilmeldinger={feilmeldinger.length > 0} feilmeldinger={feilmeldinger ?? []} />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initiering;
