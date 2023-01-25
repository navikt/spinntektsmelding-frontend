import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';

interface LonnsendringDatoProps {
  onChangeLonnsendringsdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
}

export default function LonnsendringDato({ onChangeLonnsendringsdato, defaultDate }: LonnsendringDatoProps) {
  const { datepickerProps: datepickerPropsTariff, inputProps: inputPropsTariff } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: onChangeLonnsendringsdato,
    defaultSelected: defaultDate
  });

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <UNSAFE_DatePicker {...datepickerPropsTariff}>
        <UNSAFE_DatePicker.Input
          {...inputPropsTariff}
          label='Lønnsendring gjelder fra'
          id={'bruttoinntekt-lonnsendring-fom'}
          // error={props.hasError && 'Feltet er obligatorisk.'}
        />
      </UNSAFE_DatePicker>
    </div>
  );
}
