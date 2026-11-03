import { Button, Link, LocalAlert } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, SubmitErrorHandler, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InitieringLayout from '../../components/Initiering/InitieringLayout';
import lokalStyling from '../../styles/initiering.module.css';
import TextLabel from '../../components/TextLabel';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import SelectArbeidsgiver from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

import { useRouter } from 'next/navigation';
import {
  InitieringFritattSkjemaSchema,
  type InitieringFritattSkjema as Skjema
} from '../../schema/InitieringPeriodevalgSchema';
import formatIsoDate from '../../utils/formatIsoDate';
import { getFravaersperioder, type Periode } from '../../utils/initieringPerioder';
import { logger } from '@navikt/next-logger';
import ButtonTilbakestill from '../../components/ButtonTilbakestill';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import environment from '../../config/environment';
import useInitieringData from '../../utils/useInitieringData';
import InitieringPeriodevelger from '../../components/Initiering/InitieringPeriodevelger';
import initierMedArbeidsforhold from '../../utils/initierMedArbeidsforhold';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import type { SoeknadArbeidstaker } from '../../schema/EndepunktSykepengesoeknaderSchema';
import FeilVedHentingAvPersondata from '../../components/Initiering/FeilVedHentingAvPersondata';
import InitieringRefusjon from '../../components/Initiering/InitieringRefusjon';
import useMineTilganger from '../../utils/useMineTilganger';
import { mapArbeidsgiverTilganger } from '../../utils/initieringArbeidsgivere';

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

  const methods = useForm<Skjema>({
    resolver: zodResolver(InitieringFritattSkjemaSchema)
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

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const { data: tilganger, error: tilgangerError } = useMineTilganger(setError);

  const orgnr = useWatch({ name: 'organisasjonsnummer', control: methods.control });

  const arbeidsgiverTilganger = useMemo(() => mapArbeidsgiverTilganger(tilganger), [tilganger]);

  const {
    data: arbeidsforholdData,
    arbeidsforhold,
    fulltNavn,
    orgNavnMangler,
    organisasjonsnummer,
    spData,
    spError,
    spIsLoading: spLoading,
    forespoersler,
    sykepengePerioder
  } = useInitieringData(sykmeldt.fnr, orgnr, setError, true);

  const harArbeidsforhold = Boolean(
    spData && (spData.soeknaderArbeidstaker.length > 0 || spData.forespoersler.length > 0) && arbeidsforholdData
  );
  const harSoeknaderEllerForespoersler = Boolean(
    spError?.status === 404 || (spData?.soeknaderArbeidstaker.length === 0 && spData?.forespoersler.length === 0)
  );

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    if (!tilganger) {
      logger.warn('Fritatt fra aa-registeret. Innsending avbrutt: mangler tilgangsdata (data er undefined)');
      return;
    }
    const mottatteArbeidsforhold = EndepunktArbeidsforholdSchema.safeParse(arbeidsforholdData);
    if (!mottatteArbeidsforhold.success && harArbeidsforhold) {
      logger.error(
        `Validering av innsendte skjemadata feilet: ${JSON.stringify(
          mottatteArbeidsforhold.error.issues ?? 'Ingen issues funnet'
        )}`
      );
      return;
    }
    handleValidData(
      formData,
      mottatteArbeidsforhold?.data ?? { fulltNavn: 'Ukjent navn', underenheter: [] },
      spData?.soeknaderArbeidstaker
    );
  };

  const submitError: SubmitErrorHandler<Skjema> = (formErrors) => {
    const formData = methods.getValues();
    logger.error(
      {
        skjemadata: {
          organisasjonsnummer: formData.organisasjonsnummer,
          endreRefusjon: formData.endreRefusjon,
          forespurtSykepengePeriodeId: [undefined, 'utenKobling', 'andrePerioder'].includes(
            formData.forespurtSykepengePeriodeId
          )
            ? formData.forespurtSykepengePeriodeId
            : '[MASKERT]',
          antallValgtePerioder: formData.sykepengePeriodeId?.length ?? 0
        },
        feil: Object.entries(formErrors).map(([felt, feil]) => ({
          felt,
          type: feil.type,
          message: feil.message
        }))
      },
      'Innsending feilet grunnet valideringsfeil i skjemaet...'
    );
  };

  const handleValidData = (
    formData: Skjema,
    mottatteData: z.infer<typeof EndepunktArbeidsforholdSchema>,
    mottatteSykepengesoeknader: SoeknadArbeidstaker[] | undefined
  ) => {
    const arbeidsgiver = arbeidsgiverTilganger.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === formData.organisasjonsnummer
    );
    if (!arbeidsgiver) {
      logger.warn('Innsending avbrutt: valgt organisasjon finnes ikke i tilgangslisten');
      setError('organisasjonsnummer', {
        type: 'manual',
        message: 'Valgt organisasjon finnes ikke i tilgangslisten. Velg organisasjon på nytt.'
      });
      return;
    }
    const orgNavn = arbeidsgiver.virksomhetsnavn;

    const skjemaData: SkjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData?.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr!
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);
    if (!validationResult.success) {
      logger.error('Validering av skjemadata feilet: %j', validationResult.error.issues);
    }

    if (formData.forespurtSykepengePeriodeId === 'utenKobling') {
      handleValidFormData(skjemaData, [], orgNavn);
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
        })),
        orgNavn
      );
    }
  };

  const handleValidFormData = (validerteData: SkjemaData, sykmeldingsperiode: Periode[], orgNavn: string) => {
    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
    initEgenmeldingsperiode([]);
    tilbakestillArbeidsgiverperiode();
    setSelvbestemtType(SelvbestemtTypeConst.UtenArbeidsforhold);
    router.push('/unntattAaRegisteret');
  };

  const onSetValue = useEffectEvent((field: 'organisasjonsnummer' | 'forespurtSykepengePeriodeId', value: string) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  });

  useEffect(() => {
    if (arbeidsgiverTilganger?.length === 1) {
      onSetValue('organisasjonsnummer', arbeidsgiverTilganger[0].orgnrUnderenhet);
    }
  }, [arbeidsgiverTilganger]);

  const onResetField = useEffectEvent((field: keyof Skjema) => {
    resetField(field, { defaultValue: undefined });
  });

  const visUtenKobling =
    (spData?.forespoersler && spData?.forespoersler.length > 0) ||
    (spData?.soeknaderArbeidstaker && spData?.soeknaderArbeidstaker.length > 0);

  useEffect(() => {
    if ((!visUtenKobling && !spLoading && spData) || spError?.status === 404) {
      onSetValue('forespurtSykepengePeriodeId', 'utenKobling');
    } else {
      onResetField('forespurtSykepengePeriodeId');
    }
  }, [visUtenKobling, spLoading, spData, spError, arbeidsforholdData, arbeidsforhold.length]);
  return (
    <InitieringLayout>
      <FormProvider {...methods}>
        <form className={lokalStyling.form} onSubmit={handleSubmit(submitForm, submitError)}>
          <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
          <div className={lokalStyling.persondata}>
            <div>
              <TextLabel>Fødselsnummer</TextLabel>
              <p>{sykmeldt.fnr}</p>
            </div>
          </div>
          {!tilganger && !tilgangerError && <Loading />}
          {arbeidsgiverTilganger && (
            <div>
              <SelectArbeidsgiver
                arbeidsforhold={arbeidsgiverTilganger}
                id='organisasjonsnummer'
                register={register}
                error={errors.organisasjonsnummer?.message as string}
                description='Dette vil være enheten du representerer når du sender inn inntektsmeldingen.'
                descriptionLabel='Hvilken underenhet er personen sykmeldt fra'
              />
            </div>
          )}
          {spLoading && <Loading />}
          {(harArbeidsforhold || harSoeknaderEllerForespoersler) && (
            <>
              {harArbeidsforhold && (
                <>
                  <LocalAlert status='warning'>
                    <LocalAlert.Header>
                      <LocalAlert.Title>Vi fant sykepengesøknader for disse periodene.</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                      Vi fant sykepengesøknader for disse periodene. Velg perioden du ønsker å sende inntektsmelding
                      for. Hvis ingen av periodene stemmer med inntektsmeldingen du ønsker å sende velger du &quot;Send
                      inntektsmelding for annen periode&quot;.
                    </LocalAlert.Content>
                  </LocalAlert>

                  <InitieringPeriodevelger
                    forespoersler={forespoersler}
                    perioder={sykepengePerioder}
                    visUtenKobling={visUtenKobling}
                  />
                  <InitieringRefusjon
                    perioder={sykepengePerioder}
                    forespoersler={forespoersler}
                    organisasjonsnummer={organisasjonsnummer}
                    arbeidsforhold={arbeidsforhold}
                    fulltNavn={fulltNavn}
                    fnr={sykmeldt.fnr}
                    legend='Skal du endre refusjon for den ansatte?'
                  />
                </>
              )}
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
    </InitieringLayout>
  );
};

export default InitieringFritatt;
