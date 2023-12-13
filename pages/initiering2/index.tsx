import { Alert, Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from './initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { FormEvent, useRef, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe, { Feilmelding } from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import formatZodFeilmeldinger from '../../utils/formatZodFeilmeldinger';
import initieringSchema from '../../schema/initieringSchema';
import useSWRImmutable from 'swr/immutable';
import fetcherArbeidsforhold, { endepunktArbeidsforholdSchema } from '../../utils/fetcherArbeidsforhold';
import environment from '../../config/environment';
import { useRouter } from 'next/navigation';
import Loading from '../../components/Loading/Loading';

const Initiering: NextPage = () => {
  const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const [feilmeldinger, setFeilmeldinger] = useState<Feilmelding[] | undefined>(undefined);
  let arbeidsforhold: ArbeidsgiverSelect[] = [];
  const router = useRouter();
  const organisasjonsnummer = useRef('');
  const fulltNavn = useRef('');
  const backendFeil = useRef([] as Feilmelding[]);

  const { data, error } = useSWRImmutable([environment.initsierBlankSkjemaUrl, identitetsnummer], ([url, idToken]) =>
    fetcherArbeidsforhold(url, idToken)
  );

  const onChangeArbeidsgiverSelect = (orgNr: string) => {
    const organisasjonsnummerValidering = z.string();
    const verdi = organisasjonsnummerValidering.safeParse(orgNr);
    const skjema = initieringSchema;

    if (verdi.success) {
      organisasjonsnummer.current = verdi.data;

      const skjemaData = {
        organisasjonsnummer: organisasjonsnummer.current,
        navn: fulltNavn.current,
        personnummer: identitetsnummer
      };

      const validationResult = skjema.safeParse(skjemaData);
      const tmpFeilmeldinger: Feilmelding[] = formatZodFeilmeldinger(validationResult);
      setFeilmeldinger(tmpFeilmeldinger);
    } else {
      organisasjonsnummer.current = '';
    }
  };

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    const skjema = initieringSchema;
    e.preventDefault();
    setVisFeilmeldinger(true);
    const skjemaData = {
      organisasjonsnummer: organisasjonsnummer.current,
      fulltNavn: fulltNavn.current,
      personnummer: identitetsnummer
    };

    const validationResult = skjema.safeParse(skjemaData);

    if (validationResult.success) {
      const validert = validationResult.data;
      const orgNavn = arbeidsforhold.find(
        (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validert.organisasjonsnummer
      )?.virksomhetsnavn!;
      initPerson(validert.fulltNavn, validert.personnummer, validert.organisasjonsnummer, orgNavn);
      router.push('/blank');
      setFeilmeldinger(undefined);
    } else {
      const tmpFeilmeldinger: Feilmelding[] = formatZodFeilmeldinger(validationResult);
      setFeilmeldinger(tmpFeilmeldinger);
      setVisFeilmeldinger(true);
    }
  };

  if (data) {
    const mottatteData = endepunktArbeidsforholdSchema.safeParse(data);

    if (mottatteData.success && !mottatteData.data.feilReport) {
      arbeidsforhold =
        mottatteData?.data?.underenheter && mottatteData.data.underenheter.length > 0 && !error
          ? mottatteData.data.underenheter.map((arbeidsgiver: any) => {
              return {
                orgnrUnderenhet: arbeidsgiver.orgnrUnderenhet,
                virksomhetsnavn: arbeidsgiver.virksomhetsnavn
              };
            })
          : [];

      if (arbeidsforhold.length === 1) {
        organisasjonsnummer.current = arbeidsforhold[0].orgnrUnderenhet;
      }
      fulltNavn.current = mottatteData.data.fulltNavn;
      backendFeil.current = [];
    }

    if (mottatteData.success && mottatteData.data.feilReport) {
      const feilmeldingerFraBackend: Feilmelding[] = mottatteData.data.feilReport.feil.map((feil: any) => {
        return {
          text: feil.melding,
          felt: 'backend'
        };
      });

      backendFeil.current = feilmeldingerFraBackend;
      // setFeilmeldinger((gmlFeil) => {
      //   if (gmlFeil) return [...gmlFeil, ...feilmeldingerFraBackend];
      //   return feilmeldingerFraBackend;
      // });
    }
  }
  const visFeilemldingsliste =
    (feilmeldinger && feilmeldinger.length > 0) || (backendFeil.current && backendFeil.current.length > 0);
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
                  <p>{fulltNavn.current}</p>
                </div>
                <div>
                  <TextLabel>Personnummer</TextLabel>
                  <p>{identitetsnummer}</p>
                </div>
              </div>
              <div>
                <div>
                  {!data && !error && <Loading />}
                  {data && (
                    <SelectArbeidsgiver
                      onChangeArbeidsgiverSelect={onChangeArbeidsgiverSelect}
                      arbeidsforhold={arbeidsforhold}
                      skalViseFeilmeldinger={visFeilmeldinger}
                      feilmeldinger={feilmeldinger ?? []}
                      id='organisasjonsnummer'
                    />
                  )}
                </div>
              </div>
              <div className={lokalStyles.knapperad}>
                <Button variant='tertiary' className={lokalStyles.primaryKnapp} onClick={() => history.back()}>
                  Tilbake
                </Button>
                <Button
                  variant='primary'
                  className={lokalStyles.primaryKnapp}
                  disabled={organisasjonsnummer.current === ''}
                >
                  Neste
                </Button>
              </div>
            </form>
            <FeilListe
              skalViseFeilmeldinger={visFeilemldingsliste}
              feilmeldinger={feilmeldinger ? [...feilmeldinger, ...backendFeil.current] : [...backendFeil.current]}
            />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initiering;
