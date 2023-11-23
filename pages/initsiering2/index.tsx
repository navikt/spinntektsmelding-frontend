import { Alert, Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { ZodError, z } from 'zod';

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
import isMod11Number from '../../utils/isMod10Number';
import isFnrNumber from '../../utils/isFnrNumber';
import useBoundStore from '../../state/useBoundStore';

const Initsiering: NextPage = () => {
  const [organisasjonsnummer, setOrganisasjonsnummer] = useState<string>('');
  const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
  const [zodFeilmeldinger, setZodFeilmeldinger] = useState<ZodError>();
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);

  const customErrorMap: z.ZodErrorMap = (error, ctx) => {
    /*
    This is where you override the various error codes
    */
    switch (error.code) {
      case z.ZodIssueCode.invalid_type:
        if (error.expected === 'string') {
          return { message: `This ain't a string!` };
        }
        break;
      case z.ZodIssueCode.custom:
        // produce a custom message using error.params
        // error.params won't be set unless you passed
        // a `params` arguments into a custom validator
        const params = error.params || {};
        if (params.myField) {
          return { message: `Bad input: ${params.myField}` };
        }
        break;
    }

    // fall back to default message!
    return { message: ctx.defaultError };
  };

  const feilmeldinger: Feilmelding[] = [];

  const onChangeArbeidsgiverSelct = (e: any) => {
    const organisasjonsnummer = z.string();
    const verdi = organisasjonsnummer.safeParse(e.target.value);

    if (verdi.success) {
      setOrganisasjonsnummer(verdi.data);
    }
  };

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVisFeilmeldinger(true);
    const skjema = z.object({
      organisasjonsnummer: z
        .string()
        .transform((val) => val.replace(/\s/g, ''))
        .pipe(
          z
            .string()
            .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
            .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
        )
        .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver', path: ['organisasjonsnummer'] }),
      navn: z.string().min(1),
      personnummer: z
        .string()
        .transform((val) => val.replace(/\s/g, ''))
        .pipe(
          z
            .string()
            .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
            .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
            .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer', path: ['identitetsnummer'] })
        )
    });
    const skjemaData = {
      organisasjonsnummer: organisasjonsnummer,
      navn: 'navn',
      personnummer: identitetsnummer
    };

    const validationResult = skjema.safeParse(skjemaData, { errorMap: customErrorMap });

    if (validationResult.success) {
      console.log('submitForm', validationResult);
    } else {
      const valideringsfeil = validationResult.error.flatten();
      console.log('Feil i form', valideringsfeil);
      const feilmeldinger: Feilmelding[] = Object.keys(valideringsfeil.fieldErrors).map((feil) => {
        console.log('feil', feil);
        if (valideringsfeil) {
          console.log('valideringsfeil', valideringsfeil.fieldErrors);
          // setZodFeilmeldinger(valideringsfeil?.navn?._errors);
        }
        return {
          tekst: valideringsfeil.fieldErrors[feil].message,
          felt: feil
        };
      });

      // console.log('feilmeldinger', feilmeldinger);
      // setZodFeilmeldinger(valideringsfeil?.navn?._errors);
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
                    onChangeArbeidsgiverSelct={onChangeArbeidsgiverSelct}
                    personnr={identitetsnummer}
                    skalViseFeilmeldinger={visFeilmeldinger}
                    feilmeldinger={zodFeilmeldinger}
                  />
                </div>
              </div>
              <Button variant='primary' className={lokalStyles.primaryKnapp} disabled={organisasjonsnummer === ''}>
                Neste
              </Button>
            </form>
            <FeilListe skalViseFeilmeldinger={visFeilmeldinger} feilmeldinger={feilmeldinger} />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initsiering;
