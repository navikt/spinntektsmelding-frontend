import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';

interface RefsjonArbeidsgiverSluttdatoInterface {
  arbeidsforholdId: string;
}

export default function RefsjonArbeidsgiverSluttdato({ arbeidsforholdId }: RefsjonArbeidsgiverSluttdatoInterface) {
  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);

  const setOpphoersdato = (opphoersdato?: Date | undefined) => {
    refusjonskravetOpphoererDato(arbeidsforholdId, opphoersdato);
  };

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: setOpphoersdato
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input
        {...inputProps}
        label='Dato naturalytelse bortfaller'
        id={`lus-sluttdato-${arbeidsforholdId}`}
      />
    </UNSAFE_DatePicker>
  );
}
