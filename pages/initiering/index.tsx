import { InfoCard, Button, TextField } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InitieringLayout from '../../components/Initiering/InitieringLayout';
import lokalStyling from '../../styles/initiering.module.css';
import useBoundStore from '../../state/useBoundStore';

import FeilListe from '../../components/Feilsammendrag/FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import { InformationSquareIcon } from '@navikt/aksel-icons';

const skjemaFnrSchema = z.object({
  identitetsnummer: PersonnummerSchema,
  aarsakInnsending: z.enum(['UtenArbeidsforhold', 'MedArbeidsforhold', 'Behandlingsdager', 'Fisker'], {
    error: 'Du må velge en årsak til at du vil opprette inntektsmelding.'
  })
});

const Initiering: NextPage = () => {
  type SkjemaFnr = z.infer<typeof skjemaFnrSchema>;
  const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);
  const setAarsakSelvbestemtInnsending = useBoundStore((state) => state.setAarsakSelvbestemtInnsending);

  const methods = useForm({
    resolver: zodResolver(skjemaFnrSchema)
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  const router = useRouter();

  const submitForm: SubmitHandler<SkjemaFnr> = (skjemaData: SkjemaFnr) => {
    setIdentitetsnummer(skjemaData.identitetsnummer);
    setAarsakSelvbestemtInnsending(skjemaData.aarsakInnsending);
    if (skjemaData.aarsakInnsending === SelvbestemtTypeConst.UtenArbeidsforhold) {
      router.push('/initieringFritatt', { scroll: false });
      return;
    }
    if (skjemaData.aarsakInnsending === SelvbestemtTypeConst.Fisker) {
      router.push('/initieringFiskere', { scroll: false });
      return;
    }
    if (skjemaData.aarsakInnsending === SelvbestemtTypeConst.Behandlingsdager) {
      router.push('/initieringBehandlingsdager', { scroll: false });
      return;
    }

    router.push('/initieringAnnet', { scroll: false });
  };

  const feilmeldinger = formatRHFFeilmeldinger(errors);
  return (
    <InitieringLayout bannertittel='Inntektsmelding sykepenger' sidetittel='Inntektsmelding'>
      <InfoCard data-color='info'>
        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
          <InfoCard.Title>Du vil normalt få et varsel når Nav trenger inntektsmelding.</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          Vi sender ut varsel når arbeidsgiverperioden er ferdig og den sykmeldte har sendt inn søknad om sykepenger.
          Hvis du ikke fått denne oppgaven og du mener at du skal levere inntektsmelding så er det mulig å opprette den
          manuelt.
        </InfoCard.Content>
      </InfoCard>
      <FormProvider {...methods}>
        <form className={`${lokalStyling.form} ${lokalStyling.startForm}`} onSubmit={handleSubmit(submitForm)}>
          <VelgAarsak legend='Årsak til at du vil opprette inntektsmelding.' name='aarsakInnsending' />
          <TextField
            label='Ansattes fødselsnummer'
            description='(ddmmååxxxxx)'
            className={lokalStyling.personnummer}
            {...register('identitetsnummer')}
            error={errors.identitetsnummer?.message as string}
          />
          <Button variant='primary' className={lokalStyling.primaryKnapp}>
            Neste
          </Button>
        </form>
      </FormProvider>
      <FeilListe skalViseFeilmeldinger={feilmeldinger.length > 0} feilmeldinger={feilmeldinger ?? []} />
    </InitieringLayout>
  );
};

export default Initiering;
