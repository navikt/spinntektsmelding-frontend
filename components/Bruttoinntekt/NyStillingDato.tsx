import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';

interface NyStillingDatoProps {
  onChangeNyStillingEndringsdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
}

export default function NyStillingDato({ onChangeNyStillingEndringsdato, defaultDate }: NyStillingDatoProps) {
  const { datepickerProps, inputProps: inputPropsTariff } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: onChangeNyStillingEndringsdato,
    defaultSelected: defaultDate
  });

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <UNSAFE_DatePicker {...datepickerProps}>
        <UNSAFE_DatePicker.Input
          {...inputPropsTariff}
          label='Ny stilling fra'
          id={'bruttoinntekt-lonnsendring-fom'}
          // error={props.hasError && 'Feltet er obligatorisk.'}
        />
      </UNSAFE_DatePicker>
    </div>
  );
}
