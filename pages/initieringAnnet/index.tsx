import { Alert, Box, Button, Link } from '@navikt/ds-react';
import AlertKorrigereRefusjon from '../../components/Initiering/AlertKorrigereRefusjon';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider, useWatch, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyling from './initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useState } from 'react';
import SelectArbeidsgiver from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { useRouter } from 'next/navigation';
import {
  EndepunktSykepengesoeknader,
  EndepunktSykepengesoeknaderSchema,
  SoeknadArbeidstaker
} from '../../schema/EndepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';
import { logger } from '@navikt/next-logger';
import environment from '../../config/environment';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import useInitieringData from '../../utils/useInitieringData';
import { OrganisasjonInfo, PersonInfo } from '../../components/Initiering/InitieringInfo';
import { formaterEgenmeldingsdager, visFomDato, visTomDato } from '../../utils/initieringPerioder';
import InitieringPeriodevelger from '../../components/Initiering/InitieringPeriodevelger';
import initierMedArbeidsforhold from '../../utils/initierMedArbeidsforhold';
import { AlertEndreRefusjon } from '../../components/Initiering/AlertEndreRefusjon';

const InitieringAnnet: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const setSelvbestemtType = useBoundStore((state) => state.setSelvbestemtType);
  const setHarGradertSykmelding = useBoundStore((state) => state.setHarGradertSykmelding);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const skjemaSchema = SkjemaInitieringSchema.safeExtend({
    sykepengePeriodeId: z.array(z.uuid()).optional(),
    forespurtSykepengePeriodeId: z.uuid().or(z.literal('andrePerioder')).optional(),
    endreRefusjon: z.literal('Ja').or(z.literal('Nei')).or(z.literal('')).optional()
  }).superRefine((data, ctx) => {
    if (!data.forespurtSykepengePeriodeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Du må velge hva du vil gjøre videre',
        path: ['forespurtSykepengePeriodeId']
      });
    }
    if (data.forespurtSykepengePeriodeId === 'andrePerioder' && !data.sykepengePeriodeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Du må velge minst én periode du vil sende inntektsmelding for',
        path: ['sykepengePeriodeId']
      });
    }
    if (data.endreRefusjon === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Du må svare på dette spørsmålet',
        path: ['endreRefusjon']
      });
    }
  });

  type Skjema = z.infer<typeof skjemaSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    resetField,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods;

  const antallDagerMellomSykmeldingsperioder = 0;
  const [harValgtPeriodeMedForlengelse, setHarValgtPeriodeMedForlengelse] = useState(false);
  const [valgtePerioderMedForlengelse, setValgtePerioderMedForlengelse] = useState<string[]>([]);
  const orgnr = useWatch({ name: 'organisasjonsnummer', control: methods.control });
  const endreRefusjon: string | undefined = useWatch({ name: 'endreRefusjon', control: methods.control });
  const forespurtSykepengePeriodeId: string | undefined = useWatch({
    name: 'forespurtSykepengePeriodeId',
    control: methods.control
  });

  const {
    data,
    error,
    isLoading: arbeidsforholdIsLoading,
    arbeidsforhold,
    fulltNavn,
    orgNavnMangler,
    organisasjonsnummer,
    spData,
    spIsLoading,
    forespoersler,
    soeknaderArbeidstaker,
    sykepengePerioder
  } = useInitieringData(sykmeldt.fnr, orgnr, setError);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const mottatteSykepengesoeknader = spData ? EndepunktSykepengesoeknaderSchema.safeParse(spData) : undefined;
    const mottatteData = data ? EndepunktArbeidsforholdSchema.safeParse(data) : undefined;

    if (mottatteData?.success) {
      handleValidData(formData, mottatteData.data, mottatteSykepengesoeknader?.data);
    } else {
      logger.error(
        '[initieringAnnet] Submit stoppet: ugyldige arbeidsforholdsdata ' + JSON.stringify(mottatteData?.error.issues)
      );
    }
  };

  const handleValidData = (
    formData: Skjema,
    mottatteData: z.infer<typeof EndepunktArbeidsforholdSchema>,
    mottatteSykepengesoeknader: EndepunktSykepengesoeknader | undefined
  ) => {
    const skjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr!
    };
    const sykepengePeriodeId = formData.sykepengePeriodeId || [];

    const validertePersondata = InitieringSchema.safeParse(skjemaData);
    if (!validertePersondata.success) {
      logger.error('Validering av skjemadata feilet: %j', validertePersondata.error.issues);
    }

    if (formData.forespurtSykepengePeriodeId === 'andrePerioder') {
      // Basert på søknader fra arbeidstakeren
      const sykmeldingsperiode: SoeknadArbeidstaker[] = getSykmeldingsperiodeFraSoeknad(
        formData,
        mottatteSykepengesoeknader
      );

      if (sykepengePeriodeId.length === 0) {
        logger.info(
          '[initieringAnnet] Submit stoppet: ingen sykmeldingsperioder funnet' +
            JSON.stringify({
              formData,
              sykepengesoknader: mottatteSykepengesoeknader
            })
        );
        setError('sykepengePeriodeId', {
          message: 'Ingen sykmeldingsperioder valgt',
          type: 'manual'
        });
        return;
      }

      if (validertePersondata.success) {
        setIsLoading(true);
        const sykmeldtePerioder = sykmeldingsperiode.map((periode) => ({
          ...periode,
          vedtaksperiodeId: periode.vedtaksperiodeId,
          egenmeldingsperioder: periode.egenmeldingsperioder
        }));

        handleValidFormData(validertePersondata.data, sykmeldtePerioder);
        return;
      } else {
        logger.error(
          '[initieringAnnet] Submit stoppet: validering av skjema feilet' +
            JSON.stringify(validertePersondata.error.issues)
        );
      }
    }
    if (formData.forespurtSykepengePeriodeId) {
      router.push(`/${formData.forespurtSykepengePeriodeId}`);
    }
  };

  const getSykmeldingsperiodeFraSoeknad = (
    formData: Skjema,
    mottatteSykepengesoeknader: EndepunktSykepengesoeknader | undefined
  ) => {
    const sykmeldingsperiode =
      mottatteSykepengesoeknader?.soeknaderArbeidstaker.filter((soeknad) =>
        formData.sykepengePeriodeId?.includes(soeknad.vedtaksperiodeId)
      ) ?? [];

    return sykmeldingsperiode;
  };

  const handleValidFormData = (
    validerteData: z.infer<typeof InitieringSchema>,
    sykmeldingsperiode: SoeknadArbeidstaker[]
  ): void => {
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;

    initierMedArbeidsforhold(
      {
        initPerson,
        setSkjemaStatus,
        initFravaersperiode,
        initEgenmeldingsperiode,
        tilbakestillArbeidsgiverperiode,
        setVedtaksperiodeId,
        setSelvbestemtType,
        setHarGradertSykmelding
      },
      {
        fulltNavn: validerteData.fulltNavn,
        personnummer: validerteData.personnummer,
        organisasjonsnummer: validerteData.organisasjonsnummer,
        orgNavn
      },
      sykmeldingsperiode
    );
    router.push('/arbeidsgiverInitiertInnsending');
  };

  const onRadioChange = (value: string, field: ControllerRenderProps<Skjema, 'forespurtSykepengePeriodeId'>) => {
    resetField('sykepengePeriodeId', { defaultValue: undefined });
    resetField('endreRefusjon', { defaultValue: undefined });
    setHarValgtPeriodeMedForlengelse(false);

    field.onChange(value);
  };

  const onCheckboxChange = (value: string[], field: ControllerRenderProps<Skjema, 'sykepengePeriodeId'>) => {
    const perioder = soeknaderArbeidstaker.filter((p) => value.includes(p.vedtaksperiodeId));
    const forlengelse = perioder.find((p) => p.forlengerVedtaksperiodeId);
    if (forlengelse?.forlengerVedtaksperiodeId) {
      setHarValgtPeriodeMedForlengelse(true);
    } else {
      setHarValgtPeriodeMedForlengelse(false);
    }
    field.onChange(value);
    setValgtePerioderMedForlengelse(value);
  };

  const disablePeriodeCheck = forespurtSykepengePeriodeId !== 'andrePerioder';

  const valgtePerioder = soeknaderArbeidstaker.filter((periode) =>
    valgtePerioderMedForlengelse.includes(periode.vedtaksperiodeId)
  );

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
            <form
              className={lokalStyling.form}
              onSubmit={handleSubmit(submitForm, (formErrors) => {
                logger.error(
                  '[initieringAnnet] Submit stoppet: skjemaet er ugyldig' +
                    JSON.stringify({
                      values: methods.getValues(),
                      errors: formErrors
                    })
                );
              })}
            >
              <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
              <div className={lokalStyling.persondata}>
                <div className={lokalStyling.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p>{fulltNavn}</p>
                </div>
                <div>
                  <TextLabel>Fødselsnummer</TextLabel>
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
                        description='Dette vil være enheten du representerer når du sender inn inntektsmeldingen.'
                        descriptionLabel='Hvilken underenhet er den ansatte sykmeldt fra?'
                      />
                    </div>
                  </div>
                  {spIsLoading && <Loading />}
                  {spData && organisasjonsnummer && (
                    <>
                      <InitieringPeriodevelger
                        control={methods.control}
                        errors={errors}
                        forespoersler={forespoersler}
                        perioder={sykepengePerioder}
                        disablePeriodeCheck={disablePeriodeCheck}
                        checkboxGroupClassName={lokalStyling.checkboxGroup}
                        onRadioChange={onRadioChange}
                        onCheckboxChange={onCheckboxChange}
                        renderPeriode={(periode) => (
                          <>
                            {formatDate(periode.fom)} - {formatDate(periode.tom)}
                            <br></br>
                            {formaterEgenmeldingsdager(periode.egenmeldingsperioder)}
                            {periode.forlengerVedtaksperiodeId && ' (Forlengelse)'}
                          </>
                        )}
                      />

                      {(error ||
                        (organisasjonsnummer &&
                          data &&
                          soeknaderArbeidstaker.length === 0 &&
                          forespoersler.length === 0)) &&
                        !arbeidsforholdIsLoading &&
                        !spIsLoading && (
                          <Alert variant='error'>
                            Vi finner ingen sykepengesøknader for den valgte personen i den valgte virksomheten.
                            Kontroller at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren, og at
                            søknad om sykepenger er sendt inn.
                          </Alert>
                        )}
                    </>
                  )}
                  {harValgtPeriodeMedForlengelse && (
                    <OrdinaryJaNei legend='Skal du endre refusjonen for den ansatte?' name='endreRefusjon' />
                  )}
                  {endreRefusjon === 'Ja' && (
                    <>
                      <AlertKorrigereRefusjon />
                      {valgtePerioder.map(
                        (periode) =>
                          periode?.forlengerVedtaksperiodeId && (
                            <Box
                              paddingBlock='space-4'
                              borderWidth='1'
                              paddingInline='space-16'
                              key={periode.vedtaksperiodeId}
                            >
                              <OrganisasjonInfo orgNr={organisasjonsnummer} arbeidsforhold={arbeidsforhold} />
                              <Link href={`${environment.baseUrl}/${periode.forlengerVedtaksperiodeId}`}>
                                <PersonInfo navn={fulltNavn} fnr={sykmeldt.fnr} />
                              </Link>
                              <p>
                                Sykmeldingsperiode:{' '}
                                {visFomDato(periode.forlengerVedtaksperiodeId, soeknaderArbeidstaker)} -{' '}
                                {visTomDato(periode.forlengerVedtaksperiodeId, soeknaderArbeidstaker)}
                              </p>
                            </Box>
                          )
                      )}
                    </>
                  )}
                  {endreRefusjon === 'Nei' && <AlertEndreRefusjon />}
                </>
              )}
              <div className={lokalStyling.knapperad}>
                <Button
                  type='button'
                  variant='tertiary'
                  className={lokalStyling.primaryKnapp}
                  onClick={() => history.back()}
                >
                  Tilbake
                </Button>
                <Button
                  variant='primary'
                  className={lokalStyling.primaryKnapp}
                  loading={isLoading}
                  // disabled={blokkerInnsending}
                >
                  Neste
                </Button>
              </div>
            </form>
          </FormProvider>
          {antallDagerMellomSykmeldingsperioder > 16 && (
            <Alert variant='error' className={lokalStyling.alertPadding}>
              <Heading1>Det er mer enn 16 dager mellom sykmeldingsperiodene</Heading1>
              Hvis oppholdet mellom to sykmeldingsperioder er mer enn 16 dager, må det sendes inn en inntektsmelding for
              hver av periodene.
            </Alert>
          )}
          Du finner også forespurte inntektsmeldinger i <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

export default InitieringAnnet;
