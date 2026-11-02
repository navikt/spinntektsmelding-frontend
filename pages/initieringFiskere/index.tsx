import { Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InitieringLayout from '../../components/Initiering/InitieringLayout';
import lokalStyling from '../../styles/initiering.module.css';
import TextLabel from '../../components/TextLabel';

import { useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { useRouter } from 'next/navigation';
import FeilVedHentingAvPersondata from '../../components/Initiering/FeilVedHentingAvPersondata';
import useMineTilganger from '../../utils/useMineTilganger';
import { InitieringAnnetSchema } from '../../schema/InitieringAnnetSchema';
import { collectNestedOrgs } from '../../utils/collectNestedOrgs';
import SkjemaInitieringSchema from '../../schema/SkjemaInitieringSchema';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';

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
      handleValidData(formData, mottatteData.data);
    }
  };

  const handleValidData = (formData: Skjema, mottatteData: any) => {
    const skjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);

    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data);
    }
  };

  const handleValidFormData = (validerteData: any) => {
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;
    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    initFravaersperiode([]);
    initEgenmeldingsperiode([]);
    tilbakestillArbeidsgiverperiode();
    setSelvbestemtType(SelvbestemtTypeConst.Fisker);
    router.push('/Fisker');
  };

  return (
    <InitieringLayout>
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
              disabled={blokkerInnsending}
            >
              Neste
            </Button>
          </div>
        </form>
      </FormProvider>
      <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
    </InitieringLayout>
  );
};

export default InitieringFritatt;
