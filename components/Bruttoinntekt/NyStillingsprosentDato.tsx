import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';

interface NyStillingsprosentDatoProps {
  onChangeNyStillingsprosentdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
}

export default function NyStillingsprosentDato({
  onChangeNyStillingsprosentdato,
  defaultDate
}: NyStillingsprosentDatoProps) {
  const { datepickerProps, inputProps: inputPropsTariff } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: onChangeNyStillingsprosentdato,
    defaultSelected: defaultDate
  });

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <UNSAFE_DatePicker {...datepickerProps}>
        <UNSAFE_DatePicker.Input
          {...inputPropsTariff}
          label='Ny stillingsprosent fra'
          id={'bruttoinntekt-lonnsendring-fom'}
          // error={props.hasError && 'Feltet er obligatorisk.'}
        />
      </UNSAFE_DatePicker>
    </div>
  );
}
