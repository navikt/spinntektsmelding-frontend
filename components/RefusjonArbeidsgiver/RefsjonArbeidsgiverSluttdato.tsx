import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';

interface RefsjonArbeidsgiverSluttdatoInterface {}

export default function RefsjonArbeidsgiverSluttdato({}: RefsjonArbeidsgiverSluttdatoInterface) {
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
      <UNSAFE_DatePicker.Input {...inputProps} label='Dato naturalytelse bortfaller' id={'lus-sluttdato'} />
    </UNSAFE_DatePicker>
  );
}
