import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { isValid } from 'date-fns';
import { useEffect } from 'react';
import { FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

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
  if (!defaultSelected || !isValid(defaultSelected)) {
    defaultSelected = undefined;
  }

  const { control } = useFormContext();

  const {
    field,
    // fieldState: { invalid, isTouched, isDirty },
    formState: { errors }
    // formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control

    // rules: { required: true },
  });

  const error = findErrorInRHFErrors(name, errors);

  const { datepickerProps, inputProps, reset } = useDatepicker({
    toDate: toDate,
    fromDate: fromDate,
    onDateChange: field.onChange,
    defaultSelected: defaultSelected,
    defaultMonth: defaultMonth
  });

  useEffect(() => {
    if (typeof defaultSelected === 'undefined') {
      reset();
    }
  }, [defaultSelected]); // eslint-disable-line

  return (
    <DatePicker {...datepickerProps}>
      <DatePicker.Input
        {...inputProps}
        label={label}
        id={name}
        hideLabel={hideLabel}
        disabled={disabled}
        error={error}
      />
    </DatePicker>
  );
}
