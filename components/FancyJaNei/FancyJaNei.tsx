import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';
import classNames from 'classnames/bind';
import lokalStyles from './FancyJaNei.module.css';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

interface FancyJaNeiProps {
  legend: string;
  name: string;
}

export default function FancyJaNei({ legend, name }: Readonly<FancyJaNeiProps>) {
  const {
    formState: { errors },
    watch,
    getValues
  } = useFormContext();

  let radioStatus = watch(name);
  if (radioStatus === undefined) {
    radioStatus = getValues(name);
  }

  const error = findErrorInRHFErrors(name, errors);

  let cx = classNames.bind(lokalStyles);
  const classNameJa = cx({ fancyRadio: true, selectedRadio: radioStatus === 'Ja' });
  const classNameNei = cx({ fancyRadio: true, selectedRadio: radioStatus === 'Nei' });

  return (
    <Controller
      name={name}
      rules={{ required: 'Du må svare på dette spørsmålet' }}
      defaultValue={''}
      render={({ field }) => (
        <RadioGroup {...field} legend={legend} className={lokalStyles.fancyRadioGruppe} error={error} id={name}>
          <Radio value='Ja' className={classNameJa} id={field.name + '_ja'}>
            Ja
          </Radio>
          <Radio value='Nei' className={classNameNei} id={field.name + '_nei'}>
            Nei
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
