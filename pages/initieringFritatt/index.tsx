import { Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from '../initieringAnnet/initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useState } from 'react';
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

const InitieringFritatt: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const setSelvbestemtType = useBoundStore((state) => state.setSelvbestemtType);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
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
    setError,
    handleSubmit,
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
    const mottatteData = data ? InitieringAnnetSchema.safeParse(formData) : undefined;

    if (mottatteData?.success) {
      handleValidData(formData, mottatteData.data, []);
    }
  };

  const handleValidData = (formData: Skjema, mottatteData: any, mottatteSykepengesoeknader: any) => {
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
                {/* <div className={lokalStyles.navn}>
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
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

export default InitieringFritatt;
