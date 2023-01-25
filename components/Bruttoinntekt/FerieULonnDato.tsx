import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';
import { DateRange } from 'react-day-picker';

interface FerieULonnDatoProps {
  onFerieRangeChange: (dateValue: DateRange | undefined) => void;
  defaultRange?: { fom?: Date; tom?: Date };
}

export default function FerieULonnDato({ onFerieRangeChange, defaultRange }: FerieULonnDatoProps) {
  const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
    toDate: new Date(),
    onRangeChange: onFerieRangeChange,
    defaultSelected: {
      from: defaultRange?.fom,
      to: defaultRange?.tom
    }
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps}>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <UNSAFE_DatePicker.Input {...fromInputProps} label='Fra dato ferie' id={'bruttoinntekt-ful-fom'} />
        <UNSAFE_DatePicker.Input {...toInputProps} label='Til dato ferie' id={'bruttoinntekt-ful-tom'} />
      </div>
    </UNSAFE_DatePicker>
  );
}
