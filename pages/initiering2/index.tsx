import { Alert, Button, Link } from '@navikt/ds-react';
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

import { endepunktArbeidsforholdSchema } from '../../utils/fetcherArbeidsforhold';
import environment from '../../config/environment';
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
import numberOfDaysInRanges from '../../utils/numberOfDaysInRanges';
import { Periode } from '../../state/state';
import { useRouter } from 'next/router';
import useArbeidsforhold from '../../utils/useArbeidsforhold';

const Initiering2: NextPage = () => {
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const router = useRouter();

  let arbeidsforhold: ArbeidsgiverSelect[] = [];
  let perioder: { fom: Date; tom: Date; id: string }[] = [];

  let fulltNavn = '';
  const backendFeil = useRef([] as Feilmelding[]);

  const skjemaSchema = z
    .object({
      organisasjonsnummer: z
        .string({
          required_error: 'Sjekk at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren'
        })
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
      if (!value.perioder || value.perioder.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vennligst velg en periode',
          path: ['perioder']
        });
      }

      if (value.perioder && value.perioder.length > 0) {
        const sortedPerioder = value.perioder.toSorted((a, b) => {
          if (a.fom < b.fom) {
            return -1;
          } else if (a.fom > b.fom) {
            return 1;
          } else {
            return 0;
          }
        });
        for (let i = 0; i < sortedPerioder.length - 1; i++) {
          if (sortedPerioder[i].tom >= sortedPerioder[i + 1].fom) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Periodene kan ikke overlappe',
              path: ['perioder']
            });
          }
        }

        for (let i = 0; i < sortedPerioder.length - 1; i++) {
          if (
            Math.abs(differenceInDays(parseIsoDate(sortedPerioder[i].tom), parseIsoDate(sortedPerioder[i + 1].fom))) >
            16
          ) {
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
    watch,
    handleSubmit,
    formState: { errors }
  } = methods;

  const { data, error } = useArbeidsforhold(identitetsnummer, backendFeil);

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const skjema = initieringSchema;

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
          setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
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
    }
  }

  const sykeperioder = watch('perioder');

  const antallSykedager = sykeperioder
    ? numberOfDaysInRanges(
        sykeperioder.filter((periode: Periode[]) => periode !== undefined && periode.fom && periode.tom)
      )
    : 0;

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
      <PageContent title='Inntektsmelding'>
        <main className='main-content'>
          <div className={styles.padded}>
            <Heading1>Opprett inntektsmelding for et sykefravær</Heading1>
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
                {!data && !error && <Loading />}
                {data && (
                  <>
                    <div>
                      <div>
                        <SelectArbeidsgiver
                          arbeidsforhold={arbeidsforhold}
                          id='organisasjonsnummer'
                          register={register}
                          error={errors.organisasjonsnummer?.message as string}
                        />
                      </div>
                    </div>
                    <PeriodeVelger perioder={perioder} />
                    {antallSykedager > 16 && (
                      <Alert variant='error' className={lokalStyles.alertPadding}>
                        <Heading1>
                          Det er ikke mulig å opprette inntektsmelding manuelt for et sammenhengende sykefravær på over
                          16 dager
                        </Heading1>
                        Hvis et sammenhengende sykefravær er lengre enn 16 dager, vil NAV opprette en inntektsmelding.
                        Vi sender ut en forespørsel om inntektsmelding når arbeidsgiverperioden er ferdig og den
                        sykmeldte har sendt inn søknad om sykepenger. Du finner du forespørselen på{' '}
                        <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
                      </Alert>
                    )}
                  </>
                )}
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
                  <Button variant='primary' className={lokalStyles.primaryKnapp} disabled={antallSykedager > 16}>
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
