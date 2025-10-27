import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { isValid } from 'date-fns';
import { useEffect, useEffectEvent } from 'react';
import { FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

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
    defaultSelected: defaultSelected ?? field.value,
    defaultMonth: defaultMonth
  });

  const onReset = useEffectEvent(() => {
    reset();
  });

  useEffect(() => {
    if (typeof defaultSelected === 'undefined') {
      onReset();
    }
  }, [defaultSelected]);

  return (
    <DatePicker {...datepickerProps}>
      <DatePicker.Input
        {...inputProps}
        label={label}
        id={ensureValidHtmlId(name)}
        hideLabel={hideLabel}
        disabled={disabled}
        error={error}
      />
    </DatePicker>
  );
}
