import lokalStyles from './Bruttoinntekt.module.css';
import { Periode } from '../../state/state';
import ButtonSlette from '../ButtonSlette';
import Datovelger from '../Datovelger';

interface PeriodevelgerProps {
  onRangeChange: (dateValue: PeriodeParam | undefined) => void;
  defaultRange?: Periode | PeriodeParam;
  fomTekst: string;
  tomTekst: string;
  fomID: string;
  tomID: string;
  kanSlettes: boolean;
  onSlettRad: (index: string) => void;
  periodeId: string;
  toDate?: Date;
  fromDate?: Date;
  disabled?: boolean;
  defaultMonth?: Date;
  fomError?: React.ReactNode;
  tomError?: React.ReactNode;
}

export interface PeriodeParam {
  fom?: Date;
  tom?: Date;
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
  periodeId,
  toDate,
  fromDate,
  disabled,
  defaultMonth,
  fomError,
  tomError
}: PeriodevelgerProps) {
  const onSlettClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSlettRad(periodeId);
  };

  const onFomChange = (dato: Date | undefined) => {
    onRangeChange({
      fom: dato,
      tom: defaultRange?.tom
    });
  };

  const onTomChange = (dato: Date | undefined) => {
    onRangeChange({
      fom: defaultRange?.fom,
      tom: dato
    });
  };

  return (
    <>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <Datovelger
          fromDate={fromDate}
          toDate={toDate}
          label={fomTekst}
          id={fomID}
          onDateChange={onFomChange}
          defaultSelected={defaultRange?.fom}
          disabled={disabled}
          defaultMonth={defaultMonth}
          error={fomError}
        />
        <Datovelger
          fromDate={fromDate}
          label={tomTekst}
          id={tomID}
          onDateChange={onTomChange}
          defaultSelected={defaultRange?.tom}
          toDate={toDate}
          disabled={disabled}
          defaultMonth={defaultMonth || defaultRange?.fom}
          error={tomError}
        />
        {kanSlettes && (
          <ButtonSlette
            title='Slett periode'
            onClick={onSlettClick}
            className={lokalStyles.sletteknapp}
            disabled={disabled}
          />
        )}
      </div>
    </>
  );
}
