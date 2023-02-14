import lokalStyles from './Bruttoinntekt.module.css';
import { Periode } from '../../state/state';
import ButtonSlette from '../ButtonSlette';
import Datovelger from '../Datovelger';
import { useState } from 'react';

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
  defaultMonth
}: PeriodevelgerProps) {
  const [fomDate, setFomDate] = useState<Date | undefined>(defaultRange?.fom);
  const [tomDate, setTomDate] = useState<Date | undefined>(defaultRange?.tom);

  const onSlettClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSlettRad(periodeId);
  };

  const onFomChange = (dato: Date | undefined) => {
    setFomDate(dato);
    onRangeChange({
      fom: dato,
      tom: tomDate
    });
  };

  const onTomChange = (dato: Date | undefined) => {
    setTomDate(dato);
    onRangeChange({
      fom: fomDate,
      tom: dato
    });
  };

  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
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
        />
        <Datovelger
          fromDate={fromDate}
          label={tomTekst}
          id={tomID}
          onDateChange={onTomChange}
          defaultSelected={defaultRange?.tom}
          toDate={toDate}
          disabled={disabled}
          defaultMonth={defaultMonth || fomDate}
        />
      </div>
      {kanSlettes && <ButtonSlette title='Slett periode' onClick={onSlettClick} className={lokalStyles.sletteknapp} />}
    </div>
  );
}
