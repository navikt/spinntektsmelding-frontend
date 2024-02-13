import { Alert, Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from './initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useRef } from 'react';
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
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import { OrganisasjonsnummerSchema, PersonnummerSchema } from '../../validators/validerAapenInnsending';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

const Initiering2: NextPage = () => {
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];
  const router = useRouter();

  let fulltNavn = '';
  const backendFeil = useRef([] as Feilmelding[]);

  const skjemaSchema = z.object({
    organisasjonsnummer: OrganisasjonsnummerSchema,
    navn: z.string().optional(),
    personnummer: PersonnummerSchema.optional()
  });

  type Skjema = z.infer<typeof skjemaSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(skjemaSchema)
  });

  const { data, error } = useSWRImmutable([environment.initierBlankSkjemaUrl, identitetsnummer], ([url, idToken]) =>
    fetcherArbeidsforhold(url, idToken)
  );

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const skjema = initieringSchema;

    if (data) {
      const mottatteData = endepunktArbeidsforholdSchema.safeParse(data);
      if (mottatteData.success && !mottatteData.data.feilReport) {
        const skjemaData = {
          organisasjonsnummer: formData.organisasjonsnummer,
          fulltNavn: mottatteData.data.fulltNavn,
          personnummer: identitetsnummer
        };

        const validationResult = skjema.safeParse(skjemaData);

        if (validationResult.success) {
          const validert = validationResult.data;
          const orgNavn = arbeidsforhold.find(
            (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validert.organisasjonsnummer
          )?.virksomhetsnavn!;
          initPerson(validert.fulltNavn, validert.personnummer, validert.organisasjonsnummer, orgNavn);
          setSkjemaStatus(SkjemaStatus.BLANK);
          router.push('/arbeidsgiverInitiertInnsending');
        } else {
          const tmpFeilmeldinger: Feilmelding[] = formatZodFeilmeldinger(validationResult);
        }
      }
    }
  };

  if (data) {
    const mottatteData = endepunktArbeidsforholdSchema.safeParse(data);

    if (mottatteData.success) {
      fulltNavn = mottatteData.data.fulltNavn;

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
      }
    }
  }
  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste =
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
            <form className={lokalStyles.form} onSubmit={handleSubmit(submitForm)}>
              <div className={lokalStyles.persondata}>
                <div className={lokalStyles.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p>{fulltNavn}</p>
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
                      arbeidsforhold={arbeidsforhold}
                      id='organisasjonsnummer'
                      register={register}
                      error={errors.organisasjonsnummer?.message as string}
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
                  // disabled={organisasjonsnummer.current === ''}
                >
                  Neste
                </Button>
              </div>
            </form>
            <FeilListe
              skalViseFeilmeldinger={visFeilmeldingliste}
              feilmeldinger={feilmeldinger ? [...feilmeldinger, ...backendFeil.current] : [...backendFeil.current]}
            />
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default Initiering2;
