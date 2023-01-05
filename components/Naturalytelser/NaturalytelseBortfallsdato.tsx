import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';

interface NaturalytelseBortfallsdatoInterface {
  naturalytelseId: string;
  setNaturalytelseBortfallsdato: (naturalytelseId: string, dato?: Date | undefined) => void;
  defaultValue?: Date;
}

export default function NaturalytelseBortfallsdato({
  naturalytelseId,
  setNaturalytelseBortfallsdato,
  defaultValue
}: NaturalytelseBortfallsdatoInterface) {
  const setBortfallsdato = (bortfallsdato: Date | undefined) => {
    setNaturalytelseBortfallsdato(naturalytelseId, bortfallsdato);
  };

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: setBortfallsdato,
    defaultSelected: defaultValue
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <UNSAFE_DatePicker.Input
        {...inputProps}
        label='Dato naturalytelse bortfaller'
        id={'naturalytele-input-fom-dato-' + naturalytelseId}
        hideLabel={true}
      />
    </UNSAFE_DatePicker>
  );
}
