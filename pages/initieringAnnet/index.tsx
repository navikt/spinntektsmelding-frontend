import { Button, CheckboxGroup, Checkbox, Alert, Link, Heading, Box } from '@navikt/ds-react';
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
import { useEffect, useMemo, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { TDateISODate } from '../../schema/ForespurtDataSchema';
import { differenceInCalendarDays, subYears } from 'date-fns';
import { useRouter } from 'next/navigation';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import formatIsoDate from '../../utils/formatIsoDate';
import {
  EndepunktSykepengesoeknaderSchema,
  EndepunktSykepengesoeknadSchema
} from '../../schema/EndepunktSykepengesoeknaderSchema';
import formatDate from '../../utils/formatDate';
import { logger } from '@navikt/next-logger';
import environment from '../../config/environment';
import { finnSammenhengendePeriodeManuellJustering } from '../../utils/finnArbeidsgiverperiode';
import { finnSorterteUnikePerioder, overlappendePeriode } from '../../utils/finnBestemmendeFravaersdag';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import parseIsoDate from '../../utils/parseIsoDate';
import sorterFomStigende from '../../utils/sorterFomStigende';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import getEgenmeldingsperioderFromSykmelding from '../../utils/getEgenmeldingsperioderFromSykmelding';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import { finnAntallDagerMellomSykmeldingsperioder } from '../../utils/finnAntallDagerMellomSykmeldingsperioder';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';

type SykepengePeriode = {
  id: string;
  fom: Date;
  tom: Date;
  antallEgenmeldingsdager: number;
  forespoerselId?: string;
  forlengelseAv?: string;
};

type EndepunktSykepengesoeknad = z.infer<typeof EndepunktSykepengesoeknadSchema>;

function addForlengelseAvInfo(perioder: SykepengePeriode[]): SykepengePeriode[] {
  return perioder.reduce((acc, current) => {
    if (acc.length === 0) {
      acc.push(current);
      return acc;
    }
    const last = acc.at(-1);
    if (last && (last.forespoerselId || last.forlengelseAv) && differenceInCalendarDays(current.fom, last.tom) === 1) {
      acc.push({
        ...current,
        forlengelseAv: last.forespoerselId ?? last.forlengelseAv
      });
      return acc;
    } else {
      acc.push({ ...current, forlengelseAv: undefined });
      return acc;
    }
  }, [] as SykepengePeriode[]);
}

const InitieringAnnet: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const setSelvbestemtType = useBoundStore((state) => state.setSelvbestemtType);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  let orgnrUnderenhet: string | undefined = undefined;
  let antallDagerMellomSykmeldingsperioder = 0;
  let blokkerInnsending = false;

  const skjemaSchema = SkjemaInitieringSchema.safeExtend({
    sykepengePeriodeId: z.array(z.uuid()).optional()
  });

  type Skjema = z.infer<typeof skjemaSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    watch,
    setValue,
    resetField,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods;

  const orgnr = watch('organisasjonsnummer');
  const sykepengePeriodeId: string[] | undefined = watch('sykepengePeriodeId');
  const endreRefusjon: string | undefined = watch('endreRefusjon');

  const { data, error } = useArbeidsforhold(sykmeldt.fnr, setError);
  let orgNavnMangler = false;
  const handleSykepengePeriodeIdRadio = (value: any) => {
    setValue('sykepengePeriodeId', value);
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
  } = useSykepengesoeknader(sykmeldt.fnr, organisasjonsnummer, fomDato, setError);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const sykepengePerioder: SykepengePeriode[] = useMemo(() => {
    if (!spData) return [];

    const mottatteSykepengesoknader = EndepunktSykepengesoeknaderSchema.safeParse(spData);

    if (!mottatteSykepengesoknader.success) {
      logger.warn('Feil ved validering av sykepengesøknader' + JSON.stringify(mottatteSykepengesoknader.error.issues));
      return [];
    }

    let perioder =
      mottatteSykepengesoknader.data.length > 0
        ? mottatteSykepengesoknader.data.map((periode) => ({
            fom: new Date(periode.fom),
            tom: new Date(periode.tom),
            id: periode.sykepengesoknadUuid,
            antallEgenmeldingsdager: periode.egenmeldingsdagerFraSykmelding.length,
            forespoerselId: periode.forespoerselId
          }))
        : [];

    return addForlengelseAvInfo(perioder);
  }, [spData]);

  const valgteSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
    finnSorterteUnikePerioder(
      sykepengePeriodeId
        ? sykepengePerioder.filter((periode) => sykepengePeriodeId.includes(periode.id)).sort(sorterFomStigende)
        : []
    )
  );

  const mergedSykmeldingsperioder = valgteSykepengePerioder.length > 0 ? [valgteSykepengePerioder[0]] : [];

  for (const periode of valgteSykepengePerioder) {
    const aktivPeriode = mergedSykmeldingsperioder.at(-1);
    let oppdatertPeriode = null;
    if (aktivPeriode) {
      oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);
    }

    if (oppdatertPeriode && mergedSykmeldingsperioder.length > 0) {
      mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1] = {
        ...oppdatertPeriode
      };
    } else {
      mergedSykmeldingsperioder.push(periode);
    }
  }

  const valgteUnikeSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
    finnSorterteUnikePerioder(mergedSykmeldingsperioder)
  ).filter((periode) => !!periode);

  antallDagerMellomSykmeldingsperioder = finnAntallDagerMellomSykmeldingsperioder(valgteUnikeSykepengePerioder);

  if (antallDagerMellomSykmeldingsperioder > 16) {
    blokkerInnsending = true;
  }

  const harValgtPeriodeMedForlengelse =
    !!valgteUnikeSykepengePerioder && valgteUnikeSykepengePerioder.some((periode) => !!periode.forlengelseAv);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    if (harValgtPeriodeMedForlengelse && !endreRefusjon) {
      setError('endreRefusjon', {
        message: 'Angi om det skal endres refusjon for den ansatte.',
        type: 'manual'
      });
      return;
    }

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
    const sykmeldingsperiode = getSykmeldingsperiode(formData, mottatteSykepengesoeknader);

    if (sykmeldingsperiode.length === 0) {
      setError('sykepengePeriodeId', {
        message: 'Ingen sykmeldingsperioder valgt',
        type: 'manual'
      });
      return;
    }

    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data, sykmeldingsperiode);
    }
  };

  const getSykmeldingsperiode = (
    formData: Skjema,
    mottatteSykepengesoeknader:
      | SafeParseReturnType<EndepunktSykepengesoeknad[], EndepunktSykepengesoeknad[]>
      | undefined
  ) => {
    const sykmeldingsperiode: EndepunktSykepengesoeknad[] = [];
    for (const id of formData.sykepengePeriodeId || []) {
      let periode: EndepunktSykepengesoeknad | false;
      if (mottatteSykepengesoeknader?.success === false) {
        periode = false;
      } else {
        const funnetPeriode = mottatteSykepengesoeknader?.data?.find(
          (soeknad: EndepunktSykepengesoeknad) => soeknad.sykepengesoknadUuid === id
        );
        periode = funnetPeriode ?? false;
      }

      if (periode) {
        sykmeldingsperiode.push(periode);
      }
    }

    const forespoerselIdListe = sykmeldingsperiode
      .filter((periode) => !!periode.forespoerselId)
      .map((periode) => periode.forespoerselId!);

    if (forespoerselIdListe.length > 0) {
      router.push(`/${forespoerselIdListe[0]}`);
    }

    return sykmeldingsperiode;
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
    setVedtaksperiodeId(sykmeldingsperiode[0].vedtaksperiodeId);
    setSelvbestemtType(SelvbestemtTypeConst.MedArbeidsforhold);
    router.push('/arbeidsgiverInitiertInnsending');
  };

  const getFravaersperioder = (sykmeldingsperiode: any) => {
    return sykmeldingsperiode.map((periode: any) => ({
      fom: periode.fom as TDateISODate,
      tom: periode.tom as TDateISODate
    }));
  };

  useEffect(() => {
    const forlengelser = sykepengePerioder
      ?.filter((periode) => periode.forlengelseAv)
      .filter((periode) => sykepengePeriodeId?.includes(periode.id));

    if (!forlengelser || (forlengelser.length === 0 && !!endreRefusjon)) {
      resetField('endreRefusjon');
    }
  }, [endreRefusjon, resetField, sykepengePeriodeId, sykepengePerioder]);

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
                          {!!periode.forespoerselId && ' (Inntektsmelding er allerede forespurt)'}
                          {periode.forlengelseAv && ' (forlengelse)'}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  )}
                  {(spError || (organisasjonsnummer && spData && sykepengePerioder.length === 0)) && !spIsLoading && (
                    <Alert variant='error'>
                      Finner ingen sykepengesøknader for den valgte personen i den valgte organisasjonen. Sjekk at du
                      har tilgang til å opprette inntektsmelding for denne arbeidstakeren og at søknad om sykepenger er
                      sendt inn.
                    </Alert>
                  )}
                </>
              )}
              {harValgtPeriodeMedForlengelse && (
                <OrdinaryJaNei legend='Skal du endre refusjon for den ansatte?' name='endreRefusjon' />
              )}
              {endreRefusjon === 'Ja' && (
                <>
                  <Alert variant='info'>
                    <Heading spacing size='small' level='3'>
                      Du må korrigere tidligere innsendt inntektsmeldingen
                    </Heading>
                    Gå inn på den tidligere innsendte inntektsmeldingen nedenfor for å gjøre endringer på eventuelle
                    refusjontidspunkter og beløp.
                  </Alert>
                  {valgteSykepengePerioder.map(
                    (periode) =>
                      periode?.forlengelseAv && (
                        <Box paddingBlock='4' borderWidth='1' paddingInline='4' key={periode.id}>
                          <OrganisasjonInfo orgNr={organisasjonsnummer} arbeidsforhold={arbeidsforhold} />
                          <Link href={`${environment.baseUrl}/${periode.forlengelseAv}`}>
                            <PersonInfo navn={fulltNavn} fnr={sykmeldt.fnr} />
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
                  Så lenge sykepengesøknaden er en forlengelse med en tidligere innsendt inntektsmelding trenger du ikke
                  sende inn ny inntektsmelding.
                </Alert>
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

function formaterEgenmeldingsdager(antallEgenmeldingsdager: number) {
  if (antallEgenmeldingsdager === 0) {
    return null;
  }

  return antallEgenmeldingsdager === 1
    ? '(pluss 1 egenmeldingsdag)'
    : `(pluss ${antallEgenmeldingsdager} egenmeldingsdager)`;
}

function OrganisasjonInfo({
  orgNr,
  arbeidsforhold
}: Readonly<{ orgNr: string; arbeidsforhold: ArbeidsgiverSelect[] }>) {
  if (!arbeidsforhold || arbeidsforhold.length === 0 || !orgNr) {
    return null;
  }

  const virksomhetsnavn = arbeidsforhold.find(
    (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === orgNr
  )?.virksomhetsnavn;
  return (
    <div>
      <p>{virksomhetsnavn}</p>
    </div>
  );
}

function PersonInfo({ navn, fnr }: Readonly<{ navn?: string; fnr?: string }>) {
  if (!navn || !fnr) {
    return null;
  }

  const fDatoSiffer = fnr.substring(0, 6).split('');
  const fDato = `${startFDato(fDatoSiffer[0])}${fDatoSiffer[1]}.${fDatoSiffer[2]}${
    fDatoSiffer[3]
  }.${fDatoSiffer[4]}${fDatoSiffer[5]}`;

  return (
    <>
      Inntektsmelding {navn} f.{fDato}
    </>
  );
}

function startFDato(siffer: string): string {
  if (Number(siffer) > 3) {
    return (Number(siffer) - 4).toString();
  }
  return siffer;
}

function visDato(id: string, perioder: SykepengePeriode[], key: 'fom' | 'tom'): string {
  const periode = perioder.find((p) => p.forespoerselId === id);
  if (!periode) {
    return '';
  }
  return formatDate(parseIsoDate(periode[key]));
}

const visFomDato = (id: string, perioder: SykepengePeriode[]) => visDato(id, perioder, 'fom');

const visTomDato = (id: string, perioder: SykepengePeriode[]) => visDato(id, perioder, 'tom');

export default InitieringAnnet;
