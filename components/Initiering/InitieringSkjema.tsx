import { Button, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import useBoundStore from '../../state/useBoundStore';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import { hentLaasteSelvbestemtAlternativer } from '../../utils/selvbestemtAlternativerSnapshot';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import FeilListe from '../Feilsammendrag/FeilListe';
import VelgAarsak from '../VelgAarsak/VelgAarsak';
import lokalStyling from '../../styles/initiering.module.css';

export interface InitieringSkjemaProps {
  nyeSelvbestemteAlternativer: boolean;
  startNyInntektsmelding?: boolean;
}

const skjemaFnrSchema = z.object({
  identitetsnummer: PersonnummerSchema,
  aarsakInnsending: z.enum(SelvbestemtTypeConst, {
    error: 'Du må velge en årsak til at du vil opprette inntektsmelding.'
  })
});

export default function InitieringSkjema({
  nyeSelvbestemteAlternativer,
  startNyInntektsmelding = false
}: Readonly<InitieringSkjemaProps>) {
  const [alternativer, setAlternativer] = useState(() => ({
    startNyInntektsmelding,
    visNyeAlternativer: hentLaasteSelvbestemtAlternativer(nyeSelvbestemteAlternativer, startNyInntektsmelding)
  }));
  if (alternativer.startNyInntektsmelding !== startNyInntektsmelding) {
    setAlternativer({
      startNyInntektsmelding,
      visNyeAlternativer: hentLaasteSelvbestemtAlternativer(nyeSelvbestemteAlternativer, startNyInntektsmelding)
    });
  }

  type SkjemaFnr = z.infer<typeof skjemaFnrSchema>;
  const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);
  const setAarsakSelvbestemtInnsending = useBoundStore((state) => state.setAarsakSelvbestemtInnsending);
  const methods = useForm({ resolver: zodResolver(skjemaFnrSchema) });
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  const router = useRouter();
  useEffect(() => {
    if (!startNyInntektsmelding) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('ny');
    router.replace(`/initiering${url.search}${url.hash}`, { scroll: false });
  }, [router, startNyInntektsmelding]);

  const submitForm: SubmitHandler<SkjemaFnr> = (skjemaData) => {
    setIdentitetsnummer(skjemaData.identitetsnummer);
    setAarsakSelvbestemtInnsending(skjemaData.aarsakInnsending);
    switch (skjemaData.aarsakInnsending) {
      case SelvbestemtTypeConst.UtenArbeidsforhold:
        setAarsakSelvbestemtInnsending(SelvbestemtTypeConst.UtenArbeidsforhold);
        router.push('/initieringFritatt', { scroll: false });
        return;
      case SelvbestemtTypeConst.Fisker:
        setAarsakSelvbestemtInnsending(SelvbestemtTypeConst.Fisker);
        router.push('/initieringFiskere', { scroll: false });
        return;
      case SelvbestemtTypeConst.Behandlingsdager:
        setAarsakSelvbestemtInnsending(SelvbestemtTypeConst.Behandlingsdager);
        router.push('/initieringBehandlingsdager', { scroll: false });
        return;
      case SelvbestemtTypeConst.MedArbeidsforhold:
        setAarsakSelvbestemtInnsending(SelvbestemtTypeConst.MedArbeidsforhold);
        router.push('/initieringAnnet', { scroll: false });
        return;
      default:
        setAarsakSelvbestemtInnsending(SelvbestemtTypeConst.MedArbeidsforhold);
        router.push('/initieringAnnet', { scroll: false });
    }
  };

  const feilmeldinger = formatRHFFeilmeldinger(errors);
  return (
    <>
      <FormProvider {...methods}>
        <form className={`${lokalStyling.form} ${lokalStyling.startForm}`} onSubmit={handleSubmit(submitForm)}>
          <VelgAarsak
            legend='Årsak til at du vil opprette inntektsmelding.'
            name='aarsakInnsending'
            visNyeAlternativer={alternativer.visNyeAlternativer}
          />
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
    </>
  );
}
