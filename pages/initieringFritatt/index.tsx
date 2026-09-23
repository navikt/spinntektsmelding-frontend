import { Alert, Box, Button, Link } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import {
  useForm,
  SubmitHandler,
  SubmitErrorHandler,
  FormProvider,
  useWatch,
  ControllerRenderProps
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyling from './initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useEffect, useEffectEvent, useState } from 'react';
import SelectArbeidsgiver from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

import { useRouter } from 'next/navigation';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import formatIsoDate from '../../utils/formatIsoDate';
import {
  formaterEgenmeldingsdager,
  getFravaersperioder,
  visFomDato,
  visTomDato,
  type Periode
} from '../../utils/initieringPerioder';
import { logger } from '@navikt/next-logger';
import formatDate from '../../utils/formatDate';
import ButtonTilbakestill from '../../components/ButtonTilbakestill';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import environment from '../../config/environment';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import useInitieringData from '../../utils/useInitieringData';
import InitieringPeriodevelger from '../../components/Initiering/InitieringPeriodevelger';
import { OrganisasjonInfo, PersonInfo } from '../../components/Initiering/InitieringInfo';
import initierMedArbeidsforhold from '../../utils/initierMedArbeidsforhold';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import type { SoeknadArbeidstaker } from '../../schema/EndepunktSykepengesoeknaderSchema';
import { AlertEndreRefusjon } from '../../components/Initiering/AlertEndreRefusjon';
import FeilVedHentingAvPersondata from '../initieringAnnet/FeilVedHentingAvPersondata';
import AlertKorrigereRefusjon from '../../components/Initiering/AlertKorrigereRefusjon';

type SkjemaData = {
  organisasjonsnummer: string;
  fulltNavn: string;
  personnummer: string;
};

const InitieringFritatt: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setSelvbestemtType = useBoundStore((state) => state.setSelvbestemtType);
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const setHarGradertSykmelding = useBoundStore((state) => state.setHarGradertSykmelding);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const skjemaSchema = SkjemaInitieringSchema.safeExtend({
    sykepengePeriodeId: z.array(z.uuid()).optional(),
    forespurtSykepengePeriodeId: z.uuid().or(z.literal('utenKobling')).or(z.literal('andrePerioder')).optional(),
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
        message: 'Du må velge periodene som det skal sendes inntektsmelding for',
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
    setError,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors }
  } = methods;

  const [harValgtPeriodeMedForlengelse, setHarValgtPeriodeMedForlengelse] = useState(false);
  const [valgtePerioderMedForlengelse, setValgtePerioderMedForlengelse] = useState<string[]>([]);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    if (!data) {
      logger.warn('Fritatt fra aa-registeret. Innsending avbrutt: mangler tilgangsdata (data er undefined)');
      return;
    }
    const mottatteArbeidsforhold = EndepunktArbeidsforholdSchema.safeParse(data);
    if (!mottatteArbeidsforhold.success) {
      logger.error(
        `Validering av innsendte skjemadata feilet: ${JSON.stringify(
          mottatteArbeidsforhold.error.issues ?? 'Ingen issues funnet'
        )}`
      );
      return;
    }
    handleValidData(formData, mottatteArbeidsforhold.data, spData?.soeknaderArbeidstaker);
  };

  const submitError: SubmitErrorHandler<Skjema> = (formErrors) => {
    logger.error('Innsending feilet grunnet valideringsfeil i skjemaet: %j', formErrors);
  };

  const handleValidData = (
    formData: Skjema,
    mottatteData: z.infer<typeof EndepunktArbeidsforholdSchema>,
    mottatteSykepengesoeknader: SoeknadArbeidstaker[] | undefined
  ) => {
    const skjemaData: SkjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr!
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);
    if (!validationResult.success) {
      logger.error('Validering av skjemadata feilet: %j', validationResult.error.issues);
    }

    if (formData.forespurtSykepengePeriodeId === 'utenKobling') {
      handleValidFormData(skjemaData, []);
      return;
    }

    if (formData.forespurtSykepengePeriodeId === 'andrePerioder') {
      const sykmeldingsperiode = formData.sykepengePeriodeId
        ?.map((id) => mottatteSykepengesoeknader?.find((periode) => periode.vedtaksperiodeId === id))
        .filter((periode): periode is SoeknadArbeidstaker => periode !== undefined);

      if (!sykmeldingsperiode || sykmeldingsperiode.length === 0) {
        logger.warn('Innsending feilet: ingen sykmeldingsperioder valgt.');
        setError('sykepengePeriodeId', {
          message: 'Ingen sykmeldingsperioder valgt',
          type: 'manual'
        });
        return;
      }

      const orgNavn = arbeidsforhold.find(
        (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === skjemaData.organisasjonsnummer
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
          fulltNavn: skjemaData.fulltNavn,
          personnummer: skjemaData.personnummer,
          organisasjonsnummer: skjemaData.organisasjonsnummer,
          orgNavn
        },
        sykmeldingsperiode
      );
      router.push('/arbeidsgiverInitiertInnsending');
      return;
    }

    if (formData.forespurtSykepengePeriodeId) {
      router.push(`/${formData.forespurtSykepengePeriodeId}`);
      return;
    }

    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(
        validationResult.data,
        sykepengePerioder.map((periode) => ({
          fom: formatIsoDate(periode.fom)!,
          tom: formatIsoDate(periode.tom)!
        }))
      );
    }
  };

  const handleValidFormData = (validerteData: SkjemaData, sykmeldingsperiode: Periode[]) => {
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;
    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
    initEgenmeldingsperiode([]);
    tilbakestillArbeidsgiverperiode();
    setSelvbestemtType(SelvbestemtTypeConst.UtenArbeidsforhold);
    router.push('/unntattAaRegisteret');
  };

  const orgnr = useWatch({ name: 'organisasjonsnummer', control: methods.control });
  const endreRefusjon: string | undefined = useWatch({ name: 'endreRefusjon', control: methods.control });
  const forespurtSykepengePeriodeId: string | undefined = useWatch({
    name: 'forespurtSykepengePeriodeId',
    control: methods.control
  });

  const {
    data,
    error,
    arbeidsforhold,
    fulltNavn,
    orgNavnMangler,
    organisasjonsnummer,
    spData,
    spError,
    spIsLoading: spLoading,
    forespoersler,
    soeknaderArbeidstaker,
    sykepengePerioder
  } = useInitieringData(sykmeldt.fnr, orgnr, setError, true);

  const harArbeidsforhold = spData && (spData.soeknaderArbeidstaker.length > 0 || spData.forespoersler.length > 0);
  const onSetValue = useEffectEvent((name: keyof Skjema, value: any) => {
    setValue(name, value, { shouldValidate: true, shouldDirty: true });
  });

  const onResetField = useEffectEvent((name: keyof Skjema) => {
    resetField(name);
  });

  useEffect(() => {
    if (spError?.status === 404 || spData?.soeknaderArbeidstaker.length === 0) {
      console.log('Ingen tidligere innsendte søknader funnet' + spError);
      onSetValue('forespurtSykepengePeriodeId', 'utenKobling');
    } else {
      console.log('Tidligere innsendte søknader funnet' + spError);
      onResetField('forespurtSykepengePeriodeId');
    }
  }, [spError, spData?.soeknaderArbeidstaker.length]);

  useEffect(() => {
    if (arbeidsforhold.length === 1) {
      onSetValue('forespurtSykepengePeriodeId', 'utenKobling');
    }
  }, [arbeidsforhold.length]);

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
            <form className={lokalStyling.form} onSubmit={handleSubmit(submitForm, submitError)}>
              <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
              <div className={lokalStyling.persondata}>
                <div>
                  <TextLabel>Fødselsnummer</TextLabel>
                  <p>{sykmeldt.fnr}</p>
                </div>
              </div>
              {!data && !error && <Loading />}
              {data && (
                <div>
                  <SelectArbeidsgiver
                    arbeidsforhold={arbeidsforhold}
                    id='organisasjonsnummer'
                    register={register}
                    error={errors.organisasjonsnummer?.message as string}
                    description='Dette vil være enheten du representerer når du sender inn inntektsmeldingen.'
                    descriptionLabel='Hvilken underenhet er personen sykmeldt fra'
                  />
                </div>
              )}
              {spLoading && <Loading />}
              {harArbeidsforhold && (
                <>
                  <Alert variant='warning' className={lokalStyling.alertPadding}>
                    Vi fant sykepengesøknader for disse periodene. Velg perioden du ønsker å sende inntektsmelding for.
                    Hvis ingen av periodene stemmer med inntektsmeldingen du ønsker å sende velger du &quot;Send
                    inntektsmelding for annen periode&quot;.
                  </Alert>
                  <InitieringPeriodevelger
                    control={methods.control}
                    errors={errors}
                    forespoersler={forespoersler}
                    perioder={sykepengePerioder}
                    disablePeriodeCheck={disablePeriodeCheck}
                    visUtenKobling
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
                  {harValgtPeriodeMedForlengelse && (
                    <OrdinaryJaNei legend='Skal du endre refusjon for den ansatte?' name='endreRefusjon' />
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
                <Button variant='tertiary' className={lokalStyling.primaryKnapp} onClick={() => history.back()}>
                  Tilbake
                </Button>
                <Button variant='primary' className={lokalStyling.primaryKnapp} loading={isLoading}>
                  Neste
                </Button>
                <ButtonTilbakestill onClick={() => reset()} />
              </div>
            </form>
          </FormProvider>
          Inntektsmeldinger som allerede er forespurt, kan også finnes i{' '}
          <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

export default InitieringFritatt;
