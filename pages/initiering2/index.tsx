import { Button, CheckboxGroup, Checkbox, Alert, Link } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z, ZodError } from 'zod';
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
import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { MottattPeriode, TDateISODate } from '../../state/MottattData';
import { compareAsc, differenceInDays, subYears } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';
import { useRouter } from 'next/router';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import formatIsoDate from '../../utils/formatIsoDate';
import { PersonnummerSchema } from '../../schema/personnummerSchema';
import { endepunktSykepengesoeknaderSchema } from '../../schema/endepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';
import { logger } from '@navikt/next-logger';
import numberOfDaysInRanges from '../../utils/numberOfDaysInRanges';
import environment from '../../config/environment';
import { finnSammenhengendePeriodeManuellJustering } from '../../utils/finnArbeidsgiverperiode';
import { finnSorterteUnikePerioder, overlappendePeriode } from '../../utils/finnBestemmendeFravaersdag';

type SykepengePeriode = {
  id: string;
  fom: Date;
  tom: Date;
  antallEgenmeldingsdager: number;
  forespoerselId?: string;
};

const Initiering2: NextPage = () => {
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  const backendFeil = useRef([] as Feilmelding[]);
  let orgnrUnderenhet: string | undefined = undefined;
  // let antallSykedager = 0;
  let antallDagerMellomSykmeldingsperioder = 0;
  let blokkerInnsending = false;

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
    sykepengePeriodeId: z.array(z.string().uuid()).optional()
  });

  type Skjema = z.infer<typeof skjemaSchema>;
  type EndepunktSykepengesoeknader = z.infer<typeof endepunktSykepengesoeknaderSchema>;

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
    let mottatteSykepengesoeknader:
      | { success: true; data: EndepunktSykepengesoeknader }
      | { success: false; error: ZodError }
      | undefined = undefined;

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

        const sykmeldingsperiode: EndepunktSykepengesoeknader | [] = [];
        formData.sykepengePeriodeId?.forEach((id) => {
          const periode =
            mottatteSykepengesoeknader?.success &&
            mottatteSykepengesoeknader?.data?.find((soeknad) => soeknad.sykepengesoknadUuid === id);
          if (!!periode) {
            sykmeldingsperiode.push(periode);
          }
        });

        const forespoerselIdListe = sykmeldingsperiode
          .filter((periode) => !!periode.forespoerselId)
          .map((periode) => periode.forespoerselId!);

        if (forespoerselIdListe.length > 0) {
          router.push(`/${forespoerselIdListe[0]}`);

          return;
        }

        const fravaersperioder: MottattPeriode[] = sykmeldingsperiode.map((periode) => ({
          fom: periode.fom as TDateISODate,
          tom: periode.tom as TDateISODate
        }));

        const egenmeldingsperioder: MottattPeriode[] = sykmeldingsperiode
          .flatMap((periode) => {
            const sorterteEgenmeldingsdager = periode.egenmeldingsdagerFraSykmelding.toSorted();
            const egenmeldingsperiode = sorterteEgenmeldingsdager.reduce(
              (accumulator, currentValue) => {
                const tom = new Date(currentValue);
                const currentTom = new Date(accumulator[accumulator.length - 1].tom);

                if (differenceInDays(tom, currentTom) <= 1) {
                  accumulator[accumulator.length - 1].tom = currentValue as TDateISODate;
                } else {
                  accumulator.push({ fom: currentValue as TDateISODate, tom: currentValue as TDateISODate });
                }
                return accumulator;
              },
              [
                {
                  fom: sorterteEgenmeldingsdager[0] as TDateISODate,
                  tom: sorterteEgenmeldingsdager[0] as TDateISODate
                }
              ]
            );
            return egenmeldingsperiode;
          })
          .filter((element) => !!element.fom && !!element.tom);

        if (!sykmeldingsperiode || sykmeldingsperiode.length === 0) {
          backendFeil.current.push({ text: 'Ingen sykmeldingsperioder valgt', felt: 'sykepengePeriodeId' });
          return;
        }

        if (validationResult.success) {
          setIsLoading(true);
          const validerteData = validationResult.data;
          const orgNavn = arbeidsforhold.find(
            (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
          )?.virksomhetsnavn!;
          initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
          setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
          initFravaersperiode(fravaersperioder as MottattPeriode[]);
          initEgenmeldingsperiode(egenmeldingsperioder as MottattPeriode[]);
          tilbakestillArbeidsgiverperiode();
          setVedtaksperiodeId(sykmeldingsperiode[0].vedtaksperiodeId!);
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
  const sykepengePeriodeId: string[] = watch('sykepengePeriodeId');

  const organisasjonsnummer = orgnr ?? orgnrUnderenhet;

  const fomDato = formatIsoDate(subYears(new Date(), 1));
  const {
    data: spData,
    error: spError,
    isLoading: spIsLoading
  } = useSykepengesoeknader(identitetsnummer, organisasjonsnummer, fomDato, backendFeil);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  let sykepengePerioder: SykepengePeriode[] = [];

  if (!!spData) {
    const mottatteSykepengesoeknader = endepunktSykepengesoeknaderSchema.safeParse(spData);

    if (mottatteSykepengesoeknader.success) {
      sykepengePerioder =
        mottatteSykepengesoeknader.data.length > 0
          ? mottatteSykepengesoeknader.data.map((periode) => {
              return {
                fom: new Date(periode.fom),
                tom: new Date(periode.tom),
                id: periode.sykepengesoknadUuid,
                antallEgenmeldingsdager: periode.egenmeldingsdagerFraSykmelding.length,
                forespoerselId: periode.forespoerselId
              };
            })
          : [];
    } else {
      logger.error('Feil ved validering av sykepengesøknader', mottatteSykepengesoeknader.error.errors);
    }
  }
  const valgteSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
    finnSorterteUnikePerioder(
      sykepengePeriodeId
        ? sykepengePerioder
            .filter((periode) => sykepengePeriodeId.includes(periode.id))
            .toSorted((a, b) => compareAsc(a.fom, b.fom))
        : []
    )
  );

  const mergedSykmeldingsperioder = valgteSykepengePerioder.length > 0 ? [valgteSykepengePerioder[0]] : [];

  valgteSykepengePerioder.forEach((periode) => {
    const aktivPeriode = mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1];
    const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode && mergedSykmeldingsperioder.length > 0) {
      mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1] = {
        ...oppdatertPeriode
      };
    } else {
      mergedSykmeldingsperioder.push(periode);
    }
  });

  const valgteUnikeSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
    finnSorterteUnikePerioder(mergedSykmeldingsperioder)
  );

  // antallSykedager = valgteUnikeSykepengePerioder
  //   ? numberOfDaysInRanges(
  //       valgteUnikeSykepengePerioder
  //         .filter((periode) => periode !== undefined && periode.fom && periode.tom)
  //         .map((periode) => ({
  //           fom: periode.fom!,
  //           tom: periode.tom!
  //         }))
  //     )
  //   : 0;

  // if (antallSykedager > 16) {
  //   blokkerInnsending = true;
  // }

  antallDagerMellomSykmeldingsperioder = valgteUnikeSykepengePerioder
    ? finnSorterteUnikePerioder(valgteUnikeSykepengePerioder).reduce((accumulator, currentValue, index, array) => {
        if (index === 0) {
          return 0;
        }
        if (!currentValue?.fom || !currentValue?.tom) {
          return accumulator;
        }
        const currentFom = currentValue.fom;
        const previousTom = array[index - 1].tom;

        const dagerMellom = differenceInDays(currentFom!, previousTom!);
        return accumulator > dagerMellom ? accumulator : dagerMellom;
      }, 0)
    : 0;

  if (antallDagerMellomSykmeldingsperioder > 16) {
    blokkerInnsending = true;
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
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding'} />
      <PageContent title='Inntektsmelding sykepenger'>
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
                    {spIsLoading && <Loading />}
                    {spData && organisasjonsnummer && (
                      <CheckboxGroup
                        legend='Velg sykmeldingsperiode'
                        id='sykepengePeriodeId'
                        error={errors.sykepengePeriodeId?.message as string}
                        onChange={handleSykepengePeriodeIdRadio}
                      >
                        {sykepengePerioder.map((periode) => (
                          <Checkbox key={periode.id} value={periode.id} disabled={!!periode.forespoerselId}>
                            {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                            {formaterEgenmeldingsdager(periode.antallEgenmeldingsdager)}
                            {!!periode.forespoerselId && ' (Allerede forespurt periode)'}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    )}
                    {(spError || (organisasjonsnummer && spData && sykepengePerioder.length === 0)) && !spIsLoading && (
                      <Alert variant='error'>
                        Finner ingen sykepengesøknader for den valgte personen i den valgte organisasjonen. Sjekk at du
                        har tilgang til å opprette inntektsmelding for denne arbeidstakeren og at søknad om sykepenger
                        er sendt inn.
                      </Alert>
                    )}
                  </>
                )}
                <div className={lokalStyles.knapperad}>
                  <Button variant='tertiary' className={lokalStyles.primaryKnapp} onClick={() => history.back()}>
                    Tilbake
                  </Button>
                  <Button
                    variant='primary'
                    className={lokalStyles.primaryKnapp}
                    loading={isLoading}
                    disabled={blokkerInnsending}
                  >
                    Neste
                  </Button>
                </div>
              </form>
            </FormProvider>
            {/* {antallSykedager > 16 && (
              <Alert variant='error' className={lokalStyles.alertPadding}>
                <Heading1>
                  Det er ikke mulig å opprette inntektsmelding manuelt for et sammenhengende sykefravær på over 16 dager
                </Heading1>
                Hvis et sammenhengende sykefravær er lengre enn 16 dager, vil NAV opprette en inntektsmelding. Vi sender
                ut en forespørsel om inntektsmelding når arbeidsgiverperioden er ferdig og den sykmeldte har sendt inn
                søknad om sykepenger. Du finner du forespørselen på{' '}
                <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
              </Alert>
            )} */}
            {antallDagerMellomSykmeldingsperioder > 16 && (
              <Alert variant='error' className={lokalStyles.alertPadding}>
                <Heading1>Det er mer enn 16 dager mellom sykmeldingsperiodene</Heading1>
                Hvis oppholdet mellom to sykmeldingsperioder er mer enn 16 dager, må det sendes inn en inntektsmelding
                for hver av periodene.
              </Alert>
            )}
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

  return antallEgenmeldingsdager === 1
    ? '(pluss 1 egenmeldingsdag)'
    : `(pluss ${antallEgenmeldingsdager} egenmeldingsdager)`;
}

export default Initiering2;
