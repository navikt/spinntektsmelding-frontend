import { Alert, Button, Radio, RadioGroup, Link } from '@navikt/ds-react';
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
import { useRef, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe, { Feilmelding } from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import initieringSchema from '../../schema/initieringSchema';

import { endepunktArbeidsforholdSchema } from '../../utils/fetcherArbeidsforhold';
import environment from '../../config/environment';
import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { MottattPeriode } from '../../state/MottattData';
import { differenceInDays, subYears } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';
import numberOfDaysInRanges from '../../utils/numberOfDaysInRanges';
import { Periode } from '../../state/state';
import { useRouter } from 'next/router';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import formatIsoDate from '../../utils/formatIsoDate';
import { PersonnummerSchema } from '../../schema/personnummerSchema';
import { endepunktSykepengesoeknaderSchema } from '../../schema/endepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';

type SykepengePeriode = {
  id: string;
  fom: Date;
  tom: Date;
  antallEgenmeldingsdager: number;
};

type SykepengePerioder = SykepengePeriode[];

const Initiering2: NextPage = () => {
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  const backendFeil = useRef([] as Feilmelding[]);
  let orgnrUnderenhet: string | undefined = undefined;

  const skjemaSchema = z.object({
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
    sykepengePeriodeId: z.string().optional()
  });

  type Skjema = z.infer<typeof skjemaSchema>;

  const methods = useForm({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors }
  } = methods;

  const { data, error } = useArbeidsforhold(identitetsnummer, backendFeil);

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const skjema = initieringSchema;
    let mottatteSykepengesoeknader;

    if (spData) {
      mottatteSykepengesoeknader = endepunktSykepengesoeknaderSchema.safeParse(spData);
    }

    if (data) {
      const mottatteData = endepunktArbeidsforholdSchema.safeParse(data);
      if (mottatteData.success && !mottatteData.data.feilReport) {
        const skjemaData = {
          organisasjonsnummer: formData.organisasjonsnummer,
          fulltNavn: mottatteData.data.fulltNavn,
          personnummer: identitetsnummer
        };

        const validationResult = skjema.safeParse(skjemaData);

        const sykmeldingsperiode = mottatteSykepengesoeknader?.data?.find(
          (soeknad) => soeknad.sykepengesoknadUuid === formData.sykepengePeriodeId
        );

        if (validationResult.success) {
          setIsLoading(true);
          const validerteData = validationResult.data;
          const orgNavn = arbeidsforhold.find(
            (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
          )?.virksomhetsnavn!;
          initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
          setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
          initFravaersperiode(validerteData.perioder as MottattPeriode[]);
          initEgenmeldingsperiode([]);
          tilbakestillArbeidsgiverperiode();
          router.push('/arbeidsgiverInitiertInnsending');
        }
      }
    }
  };

  const handleSykepengePeriodeIdRadio = (value: any) => {
    setValue('sykepengePeriodeId', value);
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

        if (mottatteData?.data?.underenheter && mottatteData.data.underenheter.length === 1) {
          orgnrUnderenhet = mottatteData?.data?.underenheter[0]?.orgnrUnderenhet;
        }
      }
    }
  }

  const orgnr = watch('organisasjonsnummer');

  const organisasjonsnummer = orgnr ?? orgnrUnderenhet;

  const fomDato = formatIsoDate(subYears(new Date(), 1));
  console.log('identitetsnummer', identitetsnummer, orgnr, fomDato);
  const { data: spData, error: spError } = useSykepengesoeknader(
    identitetsnummer,
    organisasjonsnummer,
    fomDato,
    backendFeil
  );

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  let sykepengePerioder: SykepengePeriode[] = [];

  console.log(spError);

  if (!!spData) {
    const mottatteSykepengesoeknader = endepunktSykepengesoeknaderSchema.safeParse(spData);

    if (mottatteSykepengesoeknader.success) {
      console.log('Validering av sykepengesøknader var vellykket', spData, mottatteSykepengesoeknader.data);
      sykepengePerioder =
        mottatteSykepengesoeknader.data.length > 0
          ? mottatteSykepengesoeknader.data.map((periode) => {
              return {
                fom: new Date(periode.fom),
                tom: new Date(periode.tom),
                id: periode.sykepengesoknadUuid,
                antallEgenmeldingsdager: periode.egenmeldingsdagerFraSykmelding.length
              };
            })
          : [];
    } else {
      console.log('Feil ved validering av sykepengesøknader');
    }
  }
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
                    <RadioGroup
                      legend='Velg sykmeldingsperiode.'
                      id='sykepengePeriodeId'
                      error={errors.sykepengePeriodeId?.message as string}
                      onChange={handleSykepengePeriodeIdRadio}
                    >
                      {sykepengePerioder.map((periode) => (
                        <Radio key={periode.id} value={periode.id}>
                          {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                          {formaterEgenmeldingsdager(periode.antallEgenmeldingsdager)}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </>
                )}
                <div className={lokalStyles.knapperad}>
                  <Button variant='tertiary' className={lokalStyles.primaryKnapp} onClick={() => history.back()}>
                    Tilbake
                  </Button>
                  <Button variant='primary' className={lokalStyles.primaryKnapp} loading={isLoading}>
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

function formaterEgenmeldingsdager(antallEgenmeldingsdager: number) {
  if (antallEgenmeldingsdager === 0) {
    return null;
  }

  return antallEgenmeldingsdager === 1 ? '(1 egenmeldingsdag)' : `(${antallEgenmeldingsdager} egenmeldingsdager)`;
}

export default Initiering2;
