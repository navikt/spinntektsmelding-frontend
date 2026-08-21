import { Alert, Box, Button, Checkbox, CheckboxGroup, Heading, Link, Radio, RadioGroup } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import {
  useForm,
  SubmitHandler,
  SubmitErrorHandler,
  FormProvider,
  useWatch,
  Controller,
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
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

import { useRouter } from 'next/navigation';
import useMineTilganger from '../../utils/useMineTilganger';
import { InitieringAnnetSchema } from '../../schema/InitieringAnnetSchema';
import getEgenmeldingsperioderFromSykmelding from '../../utils/getEgenmeldingsperioderFromSykmelding';
import { collectNestedOrgs } from '../../utils/collectNestedOrgs';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import { isValid, subYears } from 'date-fns';
import formatIsoDate from '../../utils/formatIsoDate';
import {
  addForlengelseAvInfo,
  formaterEgenmeldingsdager,
  OrganisasjonInfo,
  PersonInfo,
  SykepengePeriode,
  visFomDato,
  visTomDato
} from '../initieringAnnet';
import { differenceInDays } from 'date-fns/differenceInDays';
import { logger } from '@navikt/next-logger';
import {
  EndepunktSykepengesoeknaderSchema,
  type EndepunktSykepengesoeknad
} from '../../schema/EndepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';
import ButtonTilbakestill from '../../components/ButtonTilbakestill';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import environment from '../../config/environment';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';

type SkjemaData = {
  organisasjonsnummer: string;
  fulltNavn: string;
  personnummer: string;
};

type Periode = {
  fom: string;
  tom: string;
};

function getFravaersperioder(sykmeldingsperiode: Periode[]): Periode[] {
  return sykmeldingsperiode.map((periode) => ({
    fom: periode.fom,
    tom: periode.tom
  }));
}

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

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

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

  const { data, error } = useMineTilganger(setError);

  if (data) {
    const collected = collectNestedOrgs(data);

    if (collected.length > 0) {
      arbeidsforhold = collected.map((org) => ({
        orgnrUnderenhet: org.orgnr,
        virksomhetsnavn: org.navn
      }));
    }
  }

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    if (!data) {
      logger.warn('Fritatt fra aa-registeret. Innsending avbrutt: mangler tilgangsdata (data er undefined)');
      return;
    }
    const mottatteData = InitieringAnnetSchema.safeParse(formData);
    if (!mottatteData.success) {
      logger.error(
        `Validering av innsendte skjemadata feilet: ${JSON.stringify(
          mottatteData?.error?.issues ?? 'Ingen issues funnet'
        )}`
      );
      return;
    }
    handleValidData(formData, mottatteData.data, spData);
  };

  const submitError: SubmitErrorHandler<Skjema> = (formErrors) => {
    logger.error('Innsending feilet grunnet valideringsfeil i skjemaet: %j', formErrors);
  };

  const handleValidData = (
    formData: Skjema,
    mottatteData: z.infer<typeof InitieringAnnetSchema>,
    mottatteSykepengesoeknader: EndepunktSykepengesoeknad[] | undefined
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
        ?.map((id) => mottatteSykepengesoeknader?.find((periode) => periode.sykepengesoknadUuid === id))
        .filter((periode): periode is EndepunktSykepengesoeknad => periode !== undefined);

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
      initPerson(skjemaData.fulltNavn, skjemaData.personnummer, skjemaData.organisasjonsnummer, orgNavn);
      setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
      initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
      initEgenmeldingsperiode(getEgenmeldingsperioderFromSykmelding(sykmeldingsperiode));
      tilbakestillArbeidsgiverperiode();
      setVedtaksperiodeId(sykmeldingsperiode[0].vedtaksperiodeId!);
      setSelvbestemtType(SelvbestemtTypeConst.MedArbeidsforhold);
      const harGradert = sykmeldingsperiode.some((periode) =>
        periode.soknadsperioder?.some((sp) => sp.grad < 100 || (sp.faktiskGrad != null && sp.faktiskGrad > 0))
      );
      setHarGradertSykmelding(harGradert);
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
    initEgenmeldingsperiode(getEgenmeldingsperioderFromSykmelding(sykmeldingsperiode));
    tilbakestillArbeidsgiverperiode();
    setSelvbestemtType('UtenArbeidsforhold');
    router.push('/unntattAaRegisteret');
  };

  const orgnr = useWatch({ name: 'organisasjonsnummer', control: methods.control });
  const endreRefusjon: string | undefined = useWatch({ name: 'endreRefusjon', control: methods.control });
  const forespurtSykepengePeriodeId: string | undefined = useWatch({
    name: 'forespurtSykepengePeriodeId',
    control: methods.control
  });

  const fomDato = formatIsoDate(subYears(new Date(), 1));
  const { data: spData, error: spError } = useSykepengesoeknader(sykmeldt.fnr, orgnr, fomDato, () => {});

  const harArbeidsforhold = spData && spData.length > 0;

  const onSetValue = useEffectEvent((name: keyof Skjema, value: any) => {
    setValue(name, value, { shouldValidate: true, shouldDirty: true });
  });

  const onResetField = useEffectEvent((name: keyof Skjema) => {
    resetField(name);
  });

  useEffect(() => {
    if (spError) {
      onSetValue('forespurtSykepengePeriodeId', 'utenKobling');
    } else {
      onResetField('forespurtSykepengePeriodeId');
    }
  }, [spError, spData]);

  const sykepengePerioder: SykepengePeriode[] = ((): SykepengePeriode[] => {
    if (!spData) return [];

    const mottatteSykepengesoknader = EndepunktSykepengesoeknaderSchema.safeParse(spData);

    if (!mottatteSykepengesoknader.success) {
      logger.error('Feil ved validering av sykepengesøknader: %j', mottatteSykepengesoknader.error.issues);
      return [];
    }

    const perioder =
      mottatteSykepengesoknader.data.length > 0
        ? mottatteSykepengesoknader.data.map((periode) => {
            const sorterteEgenmeldingsdager =
              Array.isArray(periode.egenmeldingsdagerFraSykmelding) && periode.egenmeldingsdagerFraSykmelding.length > 0
                ? periode.egenmeldingsdagerFraSykmelding.toSorted(
                    (a, b) => new Date(a).getTime() - new Date(b).getTime()
                  )
                : [];

            const egenmeldingsperiode =
              sorterteEgenmeldingsdager.length === 0
                ? []
                : sorterteEgenmeldingsdager
                    .reduce<{ fom: Date; tom: Date }[]>(
                      (accumulator, currentValue) => {
                        const currentDate = new Date(currentValue);
                        const last = accumulator.at(-1);

                        if (differenceInDays(currentDate, new Date(last!.tom)) <= 1) {
                          return [...accumulator.slice(0, -1), { ...last, tom: currentDate }];
                        }
                        return [...accumulator, { fom: currentDate, tom: currentDate }];
                      },
                      [
                        {
                          fom: new Date(sorterteEgenmeldingsdager[0]),
                          tom: new Date(sorterteEgenmeldingsdager[0])
                        }
                      ]
                    )
                    .filter((element) => isValid(element.fom) && isValid(element.tom));

            return {
              fom: new Date(periode.fom),
              tom: new Date(periode.tom),
              id: periode.sykepengesoknadUuid,
              antallEgenmeldingsdager: periode.egenmeldingsdagerFraSykmelding.length,
              forespoerselId: periode.forespoerselId,
              egenmeldingsperiode: egenmeldingsperiode
            };
          })
        : [];

    return addForlengelseAvInfo(perioder);
  })();

  const forespurtePerioder = sykepengePerioder.filter((periode) => !!periode.forespoerselId || !!periode.forlengelseAv);
  const ikkeForespurtePerioder = sykepengePerioder.filter(
    (periode) => !periode.forespoerselId && !periode.forlengelseAv
  );

  const harValgtPeriodeMedForlengelse = sykepengePerioder.some(
    (periode) => periode.id === forespurtSykepengePeriodeId && !!periode.forlengelseAv
  );

  const valgtePerioder = sykepengePerioder.filter((periode) => periode.id === forespurtSykepengePeriodeId);
  const valgtePerioderMedForlengelse = valgtePerioder.filter((periode) => !!periode.forlengelseAv);

  const onRadioChange = (value: string, field: ControllerRenderProps<Skjema, 'forespurtSykepengePeriodeId'>) => {
    if (value === 'andrePerioder') {
      resetField('forespurtSykepengePeriodeId');
    }

    resetField('endreRefusjon');

    field.onChange(value);
  };

  const disablePeriodeCheck = forespurtSykepengePeriodeId !== 'andrePerioder';

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
              {harArbeidsforhold && (
                <>
                  <Alert variant='warning' className={lokalStyling.alert}>
                    Vi fant sykepengesøknader for disse periodene. Velg perioden du ønsker å sende inntektsmelding for.
                    Hvis ingen av periodene stemmer med inntektsmeldingen du ønsker å sende velger du &quot;Send
                    inntektsmelding for annen periode&quot;.
                  </Alert>
                  <Controller
                    name='forespurtSykepengePeriodeId'
                    control={methods.control}
                    render={({ field }) => (
                      <RadioGroup
                        legend='Nav har bedt om inntektsmelding for disse periodene:'
                        id='forespurtSykepengePeriodeId'
                        error={errors.forespurtSykepengePeriodeId?.message as string}
                        value={field.value ?? ''}
                        onChange={(value) => onRadioChange(value, field)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        {forespurtePerioder.map((periode) => (
                          <Radio key={periode.id} value={periode.id}>
                            {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                            {formaterEgenmeldingsdager(periode.antallEgenmeldingsdager)}
                            {periode.forlengelseAv && ' (forlengelse)'}
                          </Radio>
                        ))}
                        {harValgtPeriodeMedForlengelse && (
                          <OrdinaryJaNei legend='Skal du endre refusjon for den ansatte?' name='endreRefusjon' />
                        )}
                        {endreRefusjon === 'Ja' && (
                          <>
                            <Alert variant='info'>
                              <Heading spacing size='small' level='3'>
                                Du må korrigere tidligere innsendt inntektsmeldingen
                              </Heading>
                              Gå inn på den tidligere innsendte inntektsmeldingen nedenfor for å gjøre endringer på
                              eventuelle refusjontidspunkter og beløp.
                            </Alert>
                            {valgtePerioderMedForlengelse.map(
                              (periode) =>
                                periode?.forlengelseAv && (
                                  <Box paddingBlock='space-4' borderWidth='1' paddingInline='space-4' key={periode.id}>
                                    <OrganisasjonInfo orgNr={orgnr} arbeidsforhold={arbeidsforhold} />
                                    <Link href={`${environment.baseUrl}/${periode.forlengelseAv}`}>
                                      <PersonInfo navn={'Ukjent navn'} fnr={sykmeldt.fnr} />
                                    </Link>
                                    <p>
                                      Sykmeldingsperiode {visFomDato(periode.forlengelseAv, sykepengePerioder)} -{' '}
                                      {visTomDato(periode.forlengelseAv, sykepengePerioder)}
                                    </p>
                                  </Box>
                                )
                            )}
                          </>
                        )}
                        {endreRefusjon === 'Nei' && (
                          <Alert variant='info'>
                            <Heading spacing size='small' level='3'>
                              Du trenger ikke sende inn en ny inntektsmelding for denne perioden.
                            </Heading>
                            Så lenge sykepengesøknaden er en forlengelse med en tidligere innsendt inntektsmelding
                            trenger du ikke sende inn ny inntektsmelding.
                          </Alert>
                        )}

                        {orgnr && (
                          <Controller
                            name='sykepengePeriodeId'
                            control={methods.control}
                            render={({ field }) => (
                              <>
                                <Radio value='andrePerioder' key='andrePerioder'>
                                  Eller velg en annen periode som du ønsker å sende inntektsmelding for:
                                </Radio>
                                <CheckboxGroup
                                  legend='Velg en periode som du ønsker å sende inntektsmelding for:'
                                  hideLegend
                                  id='sykepengePeriodeId'
                                  error={errors.sykepengePeriodeId?.message as string}
                                  value={field.value ?? []}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  className={lokalStyling.checkboxGroup}
                                >
                                  {ikkeForespurtePerioder.map((periode) => (
                                    <Checkbox key={periode.id} value={periode.id} disabled={disablePeriodeCheck}>
                                      {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                                      {formaterEgenmeldingsdager(periode.antallEgenmeldingsdager)}
                                      {periode.forlengelseAv && ' (forlengelse)'}
                                    </Checkbox>
                                  ))}
                                </CheckboxGroup>
                                <Radio key='utenKobling' value='utenKobling'>
                                  Send inntektsmelding for annen periode
                                </Radio>
                              </>
                            )}
                          />
                        )}
                      </RadioGroup>
                    )}
                  />
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
