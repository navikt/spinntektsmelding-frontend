import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';

interface TariffendringDatoProps {
  changeTariffEndretDato: (newDate: Date | undefined) => void;
  changeTariffKjentDato: (newDate: Date | undefined) => void;
  defaultEndringsdato?: Date;
  defaultKjentDato?: Date;
}

export default function TariffendringDato({
  changeTariffEndretDato,
  changeTariffKjentDato,
  defaultEndringsdato,
  defaultKjentDato
}: TariffendringDatoProps) {
  const { datepickerProps: datepickerPropsTariff, inputProps: inputPropsTariff } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: changeTariffEndretDato,
    defaultSelected: defaultEndringsdato
  });

  const { datepickerProps: datepickerPropsTariffKjent, inputProps: inputPropsTariffKjent } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: changeTariffKjentDato,
    defaultSelected: defaultKjentDato
  });

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <UNSAFE_DatePicker {...datepickerPropsTariff}>
        <UNSAFE_DatePicker.Input
          {...inputPropsTariff}
          label='Tariffendring gjelder fra'
          id={'bruttoinntekt-tariffendring-fom'}
          // error={props.hasError && 'Feltet er obligatorisk.'}
        />
      </UNSAFE_DatePicker>
      <UNSAFE_DatePicker {...datepickerPropsTariffKjent}>
        <UNSAFE_DatePicker.Input
          {...inputPropsTariffKjent}
          label='Dato tariffendring ble kjent'
          id={'bruttoinntekt-tariffendring-tom'}
          // error={props.hasError && 'Feltet er obligatorisk.'}
        />
      </UNSAFE_DatePicker>
    </div>
  );
}
