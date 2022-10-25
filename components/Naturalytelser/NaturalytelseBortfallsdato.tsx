import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';

interface NaturalytelseBortfallsdatoInterface {
  naturalytelseId: string;
}

export default function NaturalytelseBortfallsdato({ naturalytelseId }: NaturalytelseBortfallsdatoInterface) {
  const setNaturalytelseBortfallsdato = useBoundStore((state) => state.setNaturalytelseBortfallsdato);

  const setBortfallsdato = (bortfallsdato: Date | undefined) => {
    setNaturalytelseBortfallsdato(naturalytelseId, bortfallsdato);
  };

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: setBortfallsdato
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input
        {...inputProps}
        label='Dato naturalytelse bortfaller'
        id={'naturalytele-input-fra-dato-' + naturalytelseId}
        hideLabel={true}
      />
    </UNSAFE_DatePicker>
  );
}
