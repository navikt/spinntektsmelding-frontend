import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import { useEffect } from 'react';

interface BestemmendeFravaersdagProps {
  defaultDate: Date;
  onChangeDate: (newDate: Date | undefined) => void;
}

export default function BestemmendeFravaersdag(props: BestemmendeFravaersdagProps) {
  const setOpphoersdato = (opphoersdato?: Date | undefined) => {
    props.onChangeDate(opphoersdato);
  };

  const { datepickerProps, inputProps, setSelected } = UNSAFE_useDatepicker({
    toDate: props.defaultDate,
    onDateChange: setOpphoersdato
  });

  useEffect(() => {
    setSelected(props.defaultDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultDate]);

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input {...inputProps} label='Bestemmende fraværsdag' id={'epm-bestemmende-fravaersdag'} />
    </UNSAFE_DatePicker>
  );
}
