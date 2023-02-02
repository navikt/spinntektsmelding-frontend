import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import lokalStyles from './Bruttoinntekt.module.css';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';
import ButtonSlette from '../ButtonSlette';

interface PeriodevelgerProps {
  onRangeChange: (dateValue: DateRange | undefined) => void;
  defaultRange?: Periode;
  fomTekst: string;
  tomTekst: string;
  fomID: string;
  tomID: string;
  kanSlettes: boolean;
  onSlettRad: (index: string) => void;
  periodeId: string;
}

export default function Periodevelger({
  onRangeChange,
  defaultRange,
  fomTekst,
  tomTekst,
  fomID,
  tomID,
  kanSlettes,
  onSlettRad,
  periodeId
}: PeriodevelgerProps) {
  const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
    toDate: new Date(),
    onRangeChange: onRangeChange,
    defaultSelected: {
      from: defaultRange?.fom,
      to: defaultRange?.tom
    }
  });

  const onSlettClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSlettRad(periodeId);
  };

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <UNSAFE_DatePicker {...datepickerProps}>
        <div className={lokalStyles.endremaaanedsinntekt}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label={fomTekst} id={fomID} />
          <UNSAFE_DatePicker.Input {...toInputProps} label={tomTekst} id={tomID} />
        </div>
      </UNSAFE_DatePicker>
      {kanSlettes && <ButtonSlette title='Slett periode' onClick={onSlettClick} className={lokalStyles.sletteknapp} />}
    </div>
  );
}
