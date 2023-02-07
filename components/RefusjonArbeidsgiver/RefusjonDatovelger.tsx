import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';

interface RefusjonDatovelgerProps {
  minDate?: Date;
  maxDate?: Date;
  onDateChange?: (val?: Date | undefined) => void;
  index?: number;
}

export default function RefusjonDatovelger({ minDate, maxDate, onDateChange, index }: RefusjonDatovelgerProps) {
  const { datepickerProps, inputProps, selectedDay } = UNSAFE_useDatepicker({
    onDateChange: onDateChange,
    fromDate: minDate,
    toDate: maxDate
  });
  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input
        {...inputProps}
        label='Dato for lønnsendring'
        id={`lus-utbetaling-endring-dato-${index}`}
        // onChange={(event) => changeDatoHandler(event, key)}
      />
    </UNSAFE_DatePicker>
  );
}
