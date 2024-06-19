import { Button } from '@navikt/ds-react';
import lokalStyles from './PeriodeListevelger.module.css';
import { Periode } from '../../state/state';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import ButtonSlette from '../ButtonSlette';
import { useEffect } from 'react';
import parseIsoDate from '../../utils/parseIsoDate';

interface PeriodeListevelgerProps {
  defaultRange?: Array<{ fom: string; tom: string }>;
  fomTekst: string;
  tomTekst: string;
  defaultMonth?: Date;
  toDate?: Date;
  toDateTom?: Date;
  toDateTomFri?: boolean;
  name: string;
}

export default function PeriodeListevelger({
  defaultRange,
  fomTekst,
  tomTekst,
  defaultMonth,
  toDate,
  toDateTom,
  toDateTomFri,
  name
}: PeriodeListevelgerProps) {
  const {
    formState: { errors },
    control
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  useEffect(() => {
    if (defaultRange) {
      defaultRange.forEach((range) => {
        append({ fom: parseIsoDate(range.fom), tom: parseIsoDate(range.tom) });
      });
    }
  }, [append, defaultRange]);

  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault();
    append({});
  };

  if (!toDateTom && toDate && !toDateTomFri) {
    toDateTom = toDate;
  }

  return (
    <>
      {fields.map((range, key) => (
        <div className={lokalStyles.endremaaanedsinntekt} key={range.id}>
          <DatoVelger
            name={`${name}.${key}.fom`}
            // fromDate={fromDate}
            toDate={toDate}
            label={fomTekst}
            // defaultSelected={defaultRange?.fom}
            defaultMonth={defaultMonth}
          />
          <DatoVelger
            name={`${name}.${key}.tom`}
            // fromDate={fromDate}
            label={tomTekst}
            // defaultSelected={defaultRange?.tom}
            toDate={toDateTom}
            defaultMonth={defaultMonth}
          />
          {key > 0 && (
            <ButtonSlette title='Slett periode' onClick={() => remove(key)} className={lokalStyles.sletteknapp} />
          )}
        </div>
      ))}
      <Button variant='secondary' onClick={handleLeggTilPeriode} className={lokalStyles.leggtilperiodeknapp}>
        Legg til periode
      </Button>
    </>
  );
}
