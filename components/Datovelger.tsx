import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';

interface DatovelgerProps {
  onDateChange?: (val?: Date | undefined) => void;
  defaultSelected?: Date;
  toDate?: Date;
  fromDate?: Date;
  id?: string;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  error?: React.ReactNode;
}

export default function Datovelger({
  onDateChange,
  defaultSelected,
  toDate,
  fromDate,
  id,
  label,
  hideLabel,
  disabled,
  defaultMonth,
  error
}: DatovelgerProps) {
  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: toDate,
    fromDate: fromDate,
    onDateChange: onDateChange,
    defaultSelected: defaultSelected,
    defaultMonth: defaultMonth
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input
        {...inputProps}
        label={label}
        id={id}
        hideLabel={hideLabel}
        disabled={disabled}
        error={error}
      />
    </UNSAFE_DatePicker>
  );
}
