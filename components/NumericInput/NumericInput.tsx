import { TextField, TextFieldProps } from '@navikt/ds-react';
import { useController, useFormContext } from 'react-hook-form';
import stringishToNumber from '../../utils/stringishToNumber';

interface NumericInputProps extends TextFieldProps {
  name: string;
}

export default function NumericInput({ name, ...props }: Readonly<NumericInputProps>) {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const {
    field
    // fieldState: { invalid, isTouched, isDirty },
    // formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control
    // rules: { required: true },
  });

  return (
    <TextField
      {...field}
      error={errors[name]?.message as string}
      onChange={(e) => stringishToNumber(e.target.value)}
      value={field.value}
      {...props}
    />
  );
}
