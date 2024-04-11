import { Alert, Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
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
import initieringSchema from '../../schema/initieringSchema';
import useSWRImmutable from 'swr/immutable';

import fetcherArbeidsforhold, { endepunktArbeidsforholdSchema } from '../../utils/fetcherArbeidsforhold';
import environment from '../../config/environment';
import { useRouter } from 'next/navigation';
import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import { PersonnummerSchema } from '../../validators/validerAapenInnsending';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import PeriodeVelger from '../../components/PeriodeVelger/PeriodeVelger';
import { PeriodeSchema } from '../../validators/validerFulltSkjema';
import { MottattPeriode } from '../../state/MottattData';
import parseIsoDate from '../../utils/parseIsoDate';
import { differenceInDays } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';

const Initiering2: NextPage = () => {
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];
  let perioder: { fom: Date; tom: Date; id: string }[] = [];
  const router = useRouter();

  let fulltNavn = '';
  const backendFeil = useRef([] as Feilmelding[]);

  const skjemaSchema = z
    .object({
      organisasjonsnummer: z
        .string()
        .transform((val) => val.replace(/\s/g, ''))
        .pipe(
          z
            .string({
              required_error: 'Organisasjon er ikke valgt'
            })

            .refine((val) => isMod11Number(val), { message: 'Organisasjon er ikke valgt' })
        ),
      navn: z.string().optional(),
      personnummer: PersonnummerSchema.optional(),
      perioder: z.array(PeriodeSchema, { required_error: 'Vennligst velg en periode' }).optional()
    })
    .superRefine((value, ctx) => {
      console.log('value', value.perioder);
      if (!value.perioder || value.perioder.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vennligst velg en periode',
          path: ['perioder']
        });
      }

      if (value.perioder && value.perioder.length > 0) {
        const sortedPerioder = value.perioder.sort((a, b) => a.fom > b.fom);
        for (let i = 0; i < sortedPerioder.length - 1; i++) {
          if (sortedPerioder[i].tom >= sortedPerioder[i + 1].fom) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Periodene kan ikke overlappe',
              path: ['perioder']
            });
          }
        }
      }

      if (value.perioder && value.perioder.length > 0) {
        const sortedPerioder = value.perioder.sort((a, b) => a.fom > b.fom);
        for (let i = 0; i < sortedPerioder.length - 1; i++) {
          if (
            Math.abs(differenceInDays(parseIsoDate(sortedPerioder[i].tom), parseIsoDate(sortedPerioder[i + 1].om))) > 16
          ) {
            console.log('sortedPerioder[i].fom', sortedPerioder[i].fom, sortedPerioder[i + 1].tom);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Det kan ikke være mer enn 16 dager mellom periodene',
              path: ['perioder', i, 'fom']
            });
          }
        }
      }
    });

  type Skjema = z.infer<typeof skjemaSchema>;

  const methods = useForm({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  const { data, error } = useSWRImmutable([environment.initierBlankSkjemaUrl, identitetsnummer], ([url, idToken]) =>
    fetcherArbeidsforhold(url, idToken)
  );

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const skjema = initieringSchema;

    console.log('formData', formData);

    if (data) {
      const mottatteData = endepunktArbeidsforholdSchema.safeParse(data);
      if (mottatteData.success && !mottatteData.data.feilReport) {
        const skjemaData = {
          organisasjonsnummer: formData.organisasjonsnummer,
          fulltNavn: mottatteData.data.fulltNavn,
          personnummer: identitetsnummer,
          perioder: formData.perioder.map((periode) => {
            return {
              fom: parseIsoDate(periode.fom),
              tom: parseIsoDate(periode.tom)
            };
          })
        };

        const validationResult = skjema.safeParse(skjemaData);

        if (validationResult.success) {
          const validert = validationResult.data;
          const orgNavn = arbeidsforhold.find(
            (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validert.organisasjonsnummer
          )?.virksomhetsnavn!;
          initPerson(validert.fulltNavn, validert.personnummer, validert.organisasjonsnummer, orgNavn);
          setSkjemaStatus(SkjemaStatus.BLANK);
          initFravaersperiode(validert.perioder as MottattPeriode[]);
          tilbakestillArbeidsgiverperiode();
          router.push('/arbeidsgiverInitiertInnsending');
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

        perioder = mottatteData?.data?.perioder
          ? mottatteData?.data?.perioder.map((periode: any) => {
              return {
                fom: new Date(periode.fom),
                tom: new Date(periode.tom),
                id: periode.id
              };
            })
          : [];
      }
    } else {
      console.log('mottatteData', mottatteData.error);
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
            <FormProvider {...methods}>
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
                <PeriodeVelger perioder={perioder} />
                {errors.perioder?.root?.message && (
                  <div className='navds-form-field navds-form-field--medium navds-text-field--error endring-error-bottom-padded'>
                    <div
                      className='navds-form-field__error'
                      id='textField-error-refusjon-refusjonPrMnd'
                      aria-relevant='additions removals'
                      aria-live='polite'
                    >
                      <p className='navds-error-message navds-label' id='#perioder'>
                        {errors.perioder?.root?.message}
                      </p>
                    </div>
                  </div>
                )}
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
            </FormProvider>
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
