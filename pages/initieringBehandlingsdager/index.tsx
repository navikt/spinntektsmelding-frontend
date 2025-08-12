import { Button, Alert, Link, RadioGroup, Radio } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod/v4';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from '../initieringAnnet/initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useMemo, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { differenceInDays, subYears } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';
import { useRouter } from 'next/navigation';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useBehandlingsdager from '../../utils/useBehandlingsdager';
import formatIsoDate from '../../utils/formatIsoDate';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';
import {
  EndepunktSykepengesoeknaderSchema,
  EndepunktSykepengesoeknadSchema
} from '../../schema/EndepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';
import { logger } from '@navikt/next-logger';
import environment from '../../config/environment';
import { finnSammenhengendePeriodeManuellJustering } from '../../utils/finnArbeidsgiverperiode';
import { finnSorterteUnikePerioder, overlappendePeriode } from '../../utils/finnBestemmendeFravaersdag';
import sorterFomStigende from '../../utils/sorterFomStigende';
import FeilVedHentingAvPersondata from '../initieringAnnet/FeilVedHentingAvPersondata';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import parseIsoDate from '../../utils/parseIsoDate';

type SykepengePeriode = {
  id: string;
  fom: Date;
  tom: Date;
  antallBehandlingsdager: number;
};

const InitieringBehandlingsdager: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const setBehandlingsdager = useBoundStore((state) => state.setBehandlingsdager);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);
  const initArbeidsgiverperioder = useBoundStore((state) => state.initArbeidsgiverperioder);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  let orgnrUnderenhet: string | undefined = undefined;
  let antallDagerMellomSykmeldingsperioder = 0;
  let blokkerInnsending = false;

  const skjemaSchema = z
    .object({
      organisasjonsnummer: z
        .string({
          error: (issue) =>
            issue.input === undefined
              ? 'Sjekk at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren'
              : undefined
        })
        .transform((val) => val.replace(/\s/g, ''))
        .pipe(
          z
            .string({
              error: (issue) => (issue.input === undefined ? 'Organisasjon er ikke valgt' : undefined)
            })

            .refine((val) => isMod11Number(val), { error: 'Organisasjon er ikke valgt' })
        ),
      navn: z.string().nullable().optional(),
      personnummer: PersonnummerSchema.optional(),
      sykmeldingId: z.uuid('Du må velge en periode for behandlingsdager'),
      endreRefusjon: z.string().optional()
    })
    .superRefine((value, ctx) => {
      if (value.endreRefusjon === 'Ja') {
        ctx.issues.push({
          code: 'custom',
          error: 'Endring av refusjon for den ansatte må gjøres i den opprinnelige inntektsmeldingen.',
          path: ['endreRefusjon'],
          input: ''
        });
      }

      if (value.endreRefusjon === 'Nei') {
        ctx.issues.push({
          code: 'custom',
          error: 'Du kan ikke sende inn en inntektsmelding som forlengelse av en tidligere inntektsmelding.',
          path: ['endreRefusjon'],
          input: ''
        });
      }
    });

  type Skjema = z.infer<typeof skjemaSchema>;
  type EndepunktSykepengesoeknad = z.infer<typeof EndepunktSykepengesoeknadSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods;

  const orgnr = watch('organisasjonsnummer');
  const sykmeldingId: string | undefined = watch('sykmeldingId');

  const { data, error } = useArbeidsforhold(sykmeldt.fnr, setError);
  let orgNavnMangler = false;
  const handleSykmeldingIdRadio = (value: any) => {
    setValue('sykmeldingId', value);
  };

  if (data) {
    const mottatteData = EndepunktArbeidsforholdSchema.safeParse(data);
    if (mottatteData.success) {
      fulltNavn = mottatteData.data.fulltNavn;

      if (mottatteData.success) {
        arbeidsforhold =
          mottatteData?.data?.underenheter && mottatteData.data.underenheter.length > 0 && !error
            ? mottatteData.data.underenheter.map((arbeidsgiver: any) => {
                if (arbeidsgiver.orgnrUnderenhet === null) {
                  orgNavnMangler = true;
                }
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

  const organisasjonsnummer = orgnr ?? orgnrUnderenhet;

  const fomDato = formatIsoDate(subYears(new Date(), 1));
  const {
    data: spData,
    error: spError,
    isLoading: spIsLoading
  } = useBehandlingsdager(sykmeldt.fnr, organisasjonsnummer, fomDato, setError);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const sykepengePerioder: SykepengePeriode[] = useMemo(() => {
    if (!spData) return [];

    const mottatteBehandlingsdager = EndepunktSykepengesoeknaderSchema.safeParse(spData);
    if (!mottatteBehandlingsdager.success) {
      logger.error('Feil ved validering av sykepengesøknader', mottatteBehandlingsdager.error.errors);
      return [];
    }

    let perioder =
      mottatteBehandlingsdager.data.length > 0
        ? mottatteBehandlingsdager.data.map((periode) => ({
            fom: new Date(periode.fom),
            tom: new Date(periode.tom),
            id: periode.sykmeldingId,
            antallBehandlingsdager: periode.behandlingsdager?.length ?? 0,
            forespoerselId: periode.forespoerselId
          }))
        : [];

    return perioder;
  }, [spData]);

  const valgteSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
    finnSorterteUnikePerioder(
      sykmeldingId
        ? sykepengePerioder.filter((periode) => sykmeldingId.includes(periode.id)).toSorted(sorterFomStigende)
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
  ).filter((periode) => !!periode);

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

        const dagerMellom = differenceInDays(currentFom, previousTom);
        return accumulator > dagerMellom ? accumulator : dagerMellom;
      }, 0)
    : 0;

  if (antallDagerMellomSykmeldingsperioder > 16) {
    blokkerInnsending = true;
  }

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const mottatteSykepengesoeknader = spData ? EndepunktSykepengesoeknaderSchema.safeParse(spData) : undefined;
    const mottatteData = data ? EndepunktArbeidsforholdSchema.safeParse(data) : undefined;

    if (mottatteData?.success) {
      handleValidData(formData, mottatteData.data, mottatteSykepengesoeknader);
    }
  };

  const handleValidData = (formData: Skjema, mottatteData: any, mottatteSykepengesoeknader: any) => {
    const skjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);
    const sykmeldingsperiode = getBehandlingsdager(formData, mottatteSykepengesoeknader);
    if (!sykmeldingsperiode) {
      setError('sykmeldingId', {
        error: 'Ingen periode for behandlingsdager valgt',
        type: 'manual'
      });
      return;
    }

    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data, sykmeldingsperiode);
    }
  };

  const getBehandlingsdager = (
    formData: Skjema,
    mottatteSykepengesoeknader: z.ZodSafeParseResult<typeof EndepunktSykepengesoeknaderSchema>
  ): EndepunktSykepengesoeknad | boolean => {
    const sykmeldingsperiode =
      mottatteSykepengesoeknader?.success &&
      mottatteSykepengesoeknader?.data?.find((soeknad) => soeknad.sykmeldingId === formData.sykmeldingId);

    return sykmeldingsperiode ?? false;
  };

  const handleValidFormData = (validerteData: any, sykmeldingsperiode: any) => {
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;
    const sorterteBehandlingsdager = sykmeldingsperiode.behandlingsdager.toSorted();
    const bestemmendeFravaersdag =
      sorterteBehandlingsdager[11] ?? sorterteBehandlingsdager[sorterteBehandlingsdager.length - 1];

    const arbeidsgiverperioder = sorterteBehandlingsdager
      .map((dag: string, index: number) => {
        if (index < 12) {
          return {
            fom: dag,
            tom: dag
          };
        }
      })
      .filter((dag: any) => dag !== undefined);

    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    const valgtSykmeldingsperiode = getSykmeldingsperioder(sykmeldingsperiode);
    initFravaersperiode(valgtSykmeldingsperiode);
    tilbakestillArbeidsgiverperiode();
    setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
    setBehandlingsdager(sykmeldingsperiode.behandlingsdager);
    initArbeidsgiverperioder(arbeidsgiverperioder);
    router.push('/behandlingsdager');
  };

  const getSykmeldingsperioder = (periode: any) => {
    return [
      {
        fom: periode.fom,
        tom: periode.tom
      }
    ];
  };

  const gyldigOrgNummer = isMod11Number(organisasjonsnummer ?? '');

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding'} />
      <PageContent title='Inntektsmelding sykepenger'>
        <div className={styles.padded}>
          <Heading1 id='mainTitle'>Opprett inntektsmelding for et sykefravær</Heading1>
          <FormProvider {...methods}>
            <form className={lokalStyles.form} onSubmit={handleSubmit(submitForm)}>
              <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
              <div className={lokalStyles.persondata}>
                <div className={lokalStyles.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p>{fulltNavn}</p>
                </div>
                <div>
                  <TextLabel>Personnummer</TextLabel>
                  <p>{sykmeldt.fnr}</p>
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
                        description='Dette vil være  enheten du representerer når du sender inn inntektsmeldingen.'
                        descriptionLabel='Hvilken underenhet er personen sykmeldt fra'
                      />
                    </div>
                  </div>
                  {spIsLoading && <Loading />}
                  {spData && organisasjonsnummer && (
                    <RadioGroup
                      legend='Velg periode for behandlingsdager'
                      id='sykmeldingId'
                      error={errors.sykmeldingId?.message as string}
                      onChange={handleSykmeldingIdRadio}
                    >
                      {sykepengePerioder.map((periode) => (
                        <Radio key={periode.id} value={periode.id} disabled={periode.antallBehandlingsdager <= 12}>
                          {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                          {formaterBehandlingsdager(periode.antallBehandlingsdager)}
                        </Radio>
                      ))}
                    </RadioGroup>
                  )}
                  {(spError || (gyldigOrgNummer && spData && sykepengePerioder.length === 0)) && !spIsLoading && (
                    <Alert variant='error'>
                      Finner ingen søknader om behandlingsdager for den valgte personen i den valgte organisasjonen.
                      Sjekk at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren og at søknad om
                      behandlingsdager er sendt inn.
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
          {antallDagerMellomSykmeldingsperioder > 16 && (
            <Alert variant='error' className={lokalStyles.alertPadding}>
              <Heading1>Det er mer enn 16 dager mellom sykmeldingsperiodene</Heading1>
              Hvis oppholdet mellom to sykmeldingsperioder er mer enn 16 dager, må det sendes inn en inntektsmelding for
              hver av periodene.
            </Alert>
          )}
          Inntektsmeldinger som allerede er forespurt, kan finnes i{' '}
          <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

function formaterBehandlingsdager(antallBehandlingsdager: number) {
  if (antallBehandlingsdager === 0) {
    return null;
  }

  if (antallBehandlingsdager <= 12) {
    return '(Det må være mer enn 12 behandlingsdager før du kan sende inn inntektsmeldingen)';
  } else {
    return `(${antallBehandlingsdager} behandlingsdager)`;
  }
}

export default InitieringBehandlingsdager;
