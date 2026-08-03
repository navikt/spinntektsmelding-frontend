import { Alert, Button, Checkbox, CheckboxGroup, Link, Radio, RadioGroup } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyling from '../initieringAnnet/initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useEffect, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

import { useRouter } from 'next/navigation';
import FeilVedHentingAvPersondata from '../initieringAnnet/FeilVedHentingAvPersondata';
import useMineTilganger from '../../utils/useMineTilganger';
import { InitieringAnnetSchema } from '../../schema/InitieringAnnetSchema';
import getEgenmeldingsperioderFromSykmelding from '../../utils/getEgenmeldingsperioderFromSykmelding';
import { collectNestedOrgs } from '../../utils/collectNestedOrgs';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import { isValid, subYears } from 'date-fns';
import formatIsoDate from '../../utils/formatIsoDate';
import { addForlengelseAvInfo, formaterEgenmeldingsdager, SykepengePeriode } from '../initieringAnnet';
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

  let fulltNavn = '';
  let blokkerInnsending = false;

  const skjemaSchema = SkjemaInitieringSchema.safeExtend({
    sykepengePeriodeId: z.array(z.uuid().or(z.literal('utenKobling'))).optional(),
    forespurtSykepengePeriodeId: z.string().optional()
  }).superRefine((data, ctx) => {
    if (data.sykepengePeriodeId && data.forespurtSykepengePeriodeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Du må velge enten foresporte eller andre perioder, ikke begge deler',
        path: ['forespurtSykepengePeriodeId']
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
    formState: { errors }
  } = methods;

  const { data, error } = useMineTilganger(setError);
  let orgNavnMangler = false;

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
    console.log('formData', formData);
    const mottatteData = data ? InitieringAnnetSchema.safeParse(formData) : undefined;
    console.log('mottatteData', spData);
    console.log('formData', formData);
    if (mottatteData?.success) {
      handleValidData(formData, mottatteData.data, spData);
    }
  };

  const handleValidData = (formData: Skjema, mottatteData: any, mottatteSykepengesoeknader: any) => {
    if (
      formData.sykepengePeriodeId &&
      formData.sykepengePeriodeId.length > 0 &&
      formData.sykepengePeriodeId[0] !== 'utenKobling'
    ) {
      // arbeidsgiverInitiertInnsending
      const skjemaData = {
        organisasjonsnummer: formData.organisasjonsnummer,
        fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
        personnummer: sykmeldt.fnr
      };

      const validationResult = InitieringSchema.safeParse(skjemaData);
      // const sykmeldingsperiode = getSykmeldingsperiode(formData, mottatteSykepengesoeknader);
      const sykmeldingsperiode = formData.sykepengePeriodeId.map((id) =>
        mottatteSykepengesoeknader.find((periode: any) => periode.sykepengesoknadUuid === id)
      );
      // const mottatteSykepengesoknader = EndepunktSykepengesoeknaderSchema.safeParse(spData);
      debugger;
      if (sykmeldingsperiode.length === 0) {
        setError('sykepengePeriodeId', {
          message: 'Ingen sykmeldingsperioder valgt',
          type: 'manual'
        });
      } else {
        const orgNavn = arbeidsforhold.find(
          (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === skjemaData.organisasjonsnummer
        )?.virksomhetsnavn!;
        initPerson(skjemaData.fulltNavn, skjemaData.personnummer!, skjemaData.organisasjonsnummer, orgNavn);
        setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
        initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
        initEgenmeldingsperiode(getEgenmeldingsperioderFromSykmelding(sykmeldingsperiode));
        tilbakestillArbeidsgiverperiode();
        setVedtaksperiodeId(sykmeldingsperiode[0].vedtaksperiodeId!);
        setSelvbestemtType(SelvbestemtTypeConst.MedArbeidsforhold);
        const harGradert = sykmeldingsperiode.some((periode: EndepunktSykepengesoeknad) =>
          periode?.soknadsperioder?.some((sp) => sp.grad < 100 || (sp.faktiskGrad != null && sp.faktiskGrad > 0))
        );
        setHarGradertSykmelding(harGradert);
        router.push('/arbeidsgiverInitiertInnsending');
        return;
      }

      if (validationResult.success) {
        setIsLoading(true);
        handleValidFormData(validationResult.data, sykmeldingsperiode);
      }
      return;
    }

    if (formData.forespurtSykepengePeriodeId) {
      router.push(`/${formData.forespurtSykepengePeriodeId}`);
      return;
    }
    const skjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);
    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data, []);
    }
  };

  const handleValidFormData = (validerteData: any, sykmeldingsperiode: any) => {
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

  const getFravaersperioder = (sykmeldingsperiode: any) => {
    return sykmeldingsperiode.map((periode: any) => ({
      fom: periode.fom,
      tom: periode.tom
    }));
  };

  const orgnr = useWatch({ name: 'organisasjonsnummer', control: methods.control });
  const endreRefusjon: string | undefined = useWatch({ name: 'endreRefusjon', control: methods.control });

  const organisasjonsnummer = orgnr;

  const fomDato = formatIsoDate(subYears(new Date(), 1));
  const { data: spData } = useSykepengesoeknader(sykmeldt.fnr, organisasjonsnummer, fomDato, setError);

  const harArbeidsforhold = spData && spData.length > 0;

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
                    .reduce(
                      (accumulator: any, currentValue: any) => {
                        const currentDate = new Date(currentValue);
                        const last = accumulator[accumulator.length - 1];

                        if (differenceInDays(currentDate, new Date(last.tom)) <= 1) {
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
                    .filter((element: any) => isValid(element.fom) && isValid(element.tom));

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

  useEffect(() => {
    const forlengelser = sykepengePerioder
      ?.filter((periode) => periode.forlengelseAv)
      .filter((periode) => sykepengePeriodeId?.includes(periode.id));

    if (!forlengelser || (forlengelser.length === 0 && !!endreRefusjon)) {
      resetField('endreRefusjon');
    }
  }, [endreRefusjon, resetField, sykepengePeriodeId, sykepengePerioder]);

  const forespurtePerioder = [...sykepengePerioder].filter((periode) => !!periode.forespoerselId);
  const ikkeForespurtePerioder = [...sykepengePerioder].filter((periode) => !periode.forespoerselId);

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
            <form className={lokalStyling.form} onSubmit={handleSubmit(submitForm)}>
              <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
              <div className={lokalStyling.persondata}>
                {/* <div className={lokalStyling.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p>{fulltNavn}</p>
                </div> */}
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
                    description='Dette vil være  enheten du representerer når du sender inn inntektsmeldingen.'
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
                  {forespurtePerioder.length > 0 && (
                    <Controller
                      name='forespurtSykepengePeriodeId'
                      control={methods.control}
                      render={({ field }) => (
                        <RadioGroup
                          legend='Nav har bedt om inntektsmelding for disse periodene:'
                          id='forespurtSykepengePeriodeId'
                          error={errors.forespurtSykepengePeriodeId?.message as string}
                          value={field.value ?? ''}
                          onChange={field.onChange}
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
                        </RadioGroup>
                      )}
                    />
                  )}
                  {orgnr && (
                    <Controller
                      name='sykepengePeriodeId'
                      control={methods.control}
                      render={({ field }) => (
                        <CheckboxGroup
                          legend='Eller velg periode:'
                          id='sykepengePeriodeId'
                          error={errors.sykepengePeriodeId?.message as string}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        >
                          {ikkeForespurtePerioder.map((periode) => (
                            <Checkbox key={periode.id} value={periode.id}>
                              {formatDate(periode.fom)} - {formatDate(periode.tom)}{' '}
                              {formaterEgenmeldingsdager(periode.antallEgenmeldingsdager)}
                              {periode.forlengelseAv && ' (forlengelse)'}
                            </Checkbox>
                          ))}
                          <Checkbox key='utenKobling' value='utenKobling'>
                            Send inntektsmelding for annen periode
                          </Checkbox>
                        </CheckboxGroup>
                      )}
                    />
                  )}
                </>
              )}
              <div className={lokalStyling.knapperad}>
                <Button variant='tertiary' className={lokalStyling.primaryKnapp} onClick={() => history.back()}>
                  Tilbake
                </Button>
                <Button
                  variant='primary'
                  className={lokalStyling.primaryKnapp}
                  loading={isLoading}
                  disabled={blokkerInnsending}
                >
                  Neste
                </Button>
                <ButtonTilbakestill onClick={() => reset()} />
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
          Inntektsmeldinger som allerede er forespurt, kan også finnes i{' '}
          <Link href={environment.saksoversiktUrl}>saksoversikten</Link>.
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

export default InitieringFritatt;
