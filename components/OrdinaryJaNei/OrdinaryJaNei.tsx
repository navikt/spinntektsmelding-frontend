import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

import styles from '../../styles/Home.module.css';

interface OrdinaryJaNeiProps {
  legend: string;
  name: string;
}

export default function OrdinaryJaNei({ legend, name }: Readonly<OrdinaryJaNeiProps>) {
  const {
    formState: { errors }
  } = useFormContext();

  const errorKey = name.split('.');
  const error = errorKey.reduce((acc, key) => {
    if (acc?.[key]?.message) {
      return acc[key]?.message as string;
    } else {
      return acc?.[key];
    }
  }, errors);

  return (
    <Controller
      name={name}
      defaultValue={''}
      rules={{ required: 'Du må svare på dette spørsmålet' }}
      render={({ field }) => (
        <RadioGroup {...field} legend={legend} error={error} className={styles.radiobuttonwrapper} id={name}>
          <Radio value='Ja' id={field.name + '_ja'}>
            Ja
          </Radio>
          <Radio value='Nei' id={field.name + '_nei'}>
            Nei
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
