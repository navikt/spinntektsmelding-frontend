import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import { SelvbestemtTypeConst } from '../../state/useSkjemadataStore';

interface VelgAarsakProps {
  legend: string;
  name: string;
}

export default function VelgAarsak({ legend, name }: Readonly<VelgAarsakProps>) {
  const {
    formState: { errors }
  } = useFormContext();

  const error = findErrorInRHFErrors(name, errors);

  return (
    <Controller
      name={name}
      defaultValue={''}
      rules={{ required: 'Du må velge årsaken til at du vil sende inn her.' }}
      render={({ field }) => (
        <RadioGroup {...field} legend={legend} error={error} id={name}>
          <Radio
            value={SelvbestemtTypeConst.Behandlingsdager}
            id={field.name + '_Behandlingsdager'}
            description='Du har en ansatt som har godkjent sykmelding og sendt søknad for enkeltstående behandlingsdager'
          >
            Enkeltstående behandlingsdager
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.UtenArbeidsforhold}
            id={field.name + '_UtenArbeidsforhold'}
            description='Ambassadepersonell og utenlandske arbeidstakere'
          >
            Unntatt registrering i Aa-registeret
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.Fisker}
            id={field.name + '_Fisker'}
            description='Personer bosatt i Norge og som har fiske eller fangst i havet som hovednæring (blad B) eller binæring (blad A).'
          >
            Fisker med hyre
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.MedArbeidsforhold}
            id={field.name + '_MedArbeidsforhold'}
            description='Det skal ikke være arbeidsgiverperiode, eller det er andre grunner til at Nav ikke har etterspurt en inntektsmelding'
          >
            Annen årsak
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
