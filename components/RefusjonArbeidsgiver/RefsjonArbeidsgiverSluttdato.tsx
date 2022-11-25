import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';

export default function RefsjonArbeidsgiverSluttdato() {
  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);

  const setOpphoersdato = (opphoersdato?: Date | undefined) => {
    refusjonskravetOpphoererDato(opphoersdato);
  };

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: setOpphoersdato
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input {...inputProps} label='Angi siste dag dere krever refusjon for' id={'lus-sluttdato'} />
    </UNSAFE_DatePicker>
  );
}
