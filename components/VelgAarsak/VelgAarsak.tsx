import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

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
      rules={{ required: 'Du velge årsaken til at du vil sende inn her.' }}
      render={({ field }) => (
        <RadioGroup {...field} legend={legend} error={error} id={name}>
          <Radio
            value='Behandlingsdager'
            id={field.name + '_Behandlingsdager'}
            description='Du har en ansatt som har godkjent sykmelding og sendt søknad for enkeltstående behandlingsdager'
          >
            Enkeltstående behandlingsdager
          </Radio>
          <Radio
            value='UnntattAARegisteret'
            id={field.name + '_UnntattAARegisteret'}
            description='Ambassadepersonell, fiskerer og utenlandske arbeidstakere'
          >
            Unntatt registrering i Aa-registeret
          </Radio>
          <Radio
            value='Annet'
            id={field.name + '_Annet'}
            description='Det skal ikke være arbeidsgiverperiode, eller det er andre grunner til at Nav ikke har etterspurt en inntektsmelding'
          >
            Annen årsak
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
