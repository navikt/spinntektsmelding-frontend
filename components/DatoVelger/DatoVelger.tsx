import { FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import BaseDatePicker from './BaseDatePicker';

interface DatoVelgerProps {
  defaultSelected?: Date;
  toDate?: Date;
  fromDate?: Date;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  name: FieldPath<FieldValues>;
}

export default function DatoVelger({
  defaultSelected,
  toDate,
  fromDate,
  label,
  hideLabel,
  disabled,
  defaultMonth,
  name
}: Readonly<DatoVelgerProps>) {
  const { control } = useFormContext();

  const {
    field,
    formState: { errors }
  } = useController({
    name,
    control
  });

  const error = findErrorInRHFErrors(name, errors);

  return (
    <BaseDatePicker
      defaultSelected={defaultSelected ?? field.value}
      toDate={toDate}
      fromDate={fromDate}
      id={name}
      label={label}
      hideLabel={hideLabel}
      disabled={disabled}
      defaultMonth={defaultMonth}
      error={error}
      onDateChange={field.onChange}
    />
  );
}
