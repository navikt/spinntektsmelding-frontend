import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import { DateRange } from 'react-day-picker';
import localStyles from './EndrePerioderModal.module.css';
import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import ButtonSlette from '../ButtonSlette';
import { ValideringsfeilArbeidsgiverperiode } from './EndrePerioderModal';

interface ArbeidsgiverperiodeProps {
  arbeidsgiverperiode: FravaersPeriode;
  rangeChangeHandler: (dato: DateRange | undefined, periodeIndex: number) => void;
  periodeIndex: number;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>, periodeIndex: number) => void;
  hasError: Array<ValideringsfeilArbeidsgiverperiode> | undefined;
}

export default function Arbeidsgiverperiode({
  arbeidsgiverperiode,
  rangeChangeHandler,
  periodeIndex,
  onDelete,
  hasError
}: ArbeidsgiverperiodeProps) {
  const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
    onRangeChange: (periode) => rangeChangeHandler(periode, periodeIndex),
    toDate: new Date(),
    defaultSelected: {
      from: arbeidsgiverperiode?.fom,
      to: arbeidsgiverperiode?.tom
    }
  });

  return (
    <UNSAFE_DatePicker {...datepickerProps} id={`epm-datovelger-${periodeIndex}`} strategy='fixed'>
      <div className={localStyles.datowrapper}>
        <UNSAFE_DatePicker.Input
          {...fromInputProps}
          label='Arbeidsgiverperiode fra'
          id={`epm-fom-${periodeIndex}`}
          error={hasError && hasError[periodeIndex] && hasError[periodeIndex].fom && 'Feltet er obligatorisk.'}
        />
        <UNSAFE_DatePicker.Input
          {...toInputProps}
          label='Arbeidsgiverperiode til'
          id={`epm-tom-${periodeIndex}`}
          error={hasError && hasError[periodeIndex].tom && 'Feltet er obligatorisk.'}
        />
        {periodeIndex > 0 && (
          <ButtonSlette
            className={localStyles.sletteknapp}
            onClick={(event) => onDelete(event, periodeIndex)}
            title='Slett periode'
          />
        )}
      </div>
    </UNSAFE_DatePicker>
  );
}
