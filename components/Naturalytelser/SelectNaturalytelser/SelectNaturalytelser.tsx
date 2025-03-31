import { Select } from '@navikt/ds-react';
import naturalytelser from './naturalytelser';
import { useController, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../../utils/findErrorInRHFErrors';

type Naturalytelser = keyof typeof naturalytelser;

interface SelectNaturalytelserProps {
  name: string;
  defaultValue?: Naturalytelser;
}

export default function SelectNaturalytelser({ name, defaultValue }: Readonly<SelectNaturalytelserProps>) {
  const { control } = useFormContext();
  const {
    field,
    formState: { errors }
  } = useController({
    name,
    control
  });

  const error = findErrorInRHFErrors(name, errors);
  const ytelsesKeys = Object.keys(naturalytelser);
  const defaultYtelse = field.value ? field.value.toString().toUpperCase() : '';
  return (
    <Select label={''} onChange={field.onChange} defaultValue={defaultYtelse} error={error}>
      <option value=''>Velg naturalytelse</option>
      {ytelsesKeys.map((ytelseKey) => (
        <option value={ytelseKey} key={ytelseKey}>
          {naturalytelser[ytelseKey]}
        </option>
      ))}
    </Select>
  );
}
