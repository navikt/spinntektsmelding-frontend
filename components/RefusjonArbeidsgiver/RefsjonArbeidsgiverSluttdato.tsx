import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';

interface RefsjonArbeidsgiverSluttdatoProps {
  defaultValue?: Date;
  onDateChange: (opphoersdato?: Date | undefined) => void;
}

export default function RefsjonArbeidsgiverSluttdato(props: RefsjonArbeidsgiverSluttdatoProps) {
  const setOpphoersdato = (opphoersdato?: Date | undefined) => {
    props.onDateChange(opphoersdato);
  };

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: setOpphoersdato,
    defaultSelected: props.defaultValue
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input {...inputProps} label='Angi siste dag dere krever refusjon for' id={'lus-sluttdato'} />
    </UNSAFE_DatePicker>
  );
}
