import { Button } from '@navikt/ds-react';
import lokalStyles from './PeriodeListevelger.module.css';
import { Periode } from '../../state/state';
import Periodevelger, { PeriodeParam } from './Periodevelger';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import ButtonSlette from '../ButtonSlette';

interface PeriodeListevelgerProps {
  onRangeListChange: (dateValue?: Array<Periode>) => void;
  defaultRange?: Array<Periode>;
  fomTekst: string;
  tomTekst: string;
  defaultMonth?: Date;
  toDate?: Date;
  name: string;
}

export default function PeriodeListevelger({
  onRangeListChange,
  defaultRange,
  fomTekst,
  tomTekst,

  defaultMonth,
  toDate,
  name
}: PeriodeListevelgerProps) {
  const {
    formState: { errors },
    watch,
    getValues,
    control,
    register
  } = useFormContext();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name
  });

  // const onRangeChange = (datoer: PeriodeParam | undefined, index: string) => {
  //   const uppdatedRange = defaultRange?.map((periode) => {
  //     if (periode.id === index) {
  //       return {
  //         fom: datoer ? datoer.fom : undefined,
  //         tom: datoer ? datoer.tom : undefined,
  //         id: periode.id
  //       };
  //     }
  //     return periode;
  //   });

  //   onRangeListChange(uppdatedRange);
  // };

  // useEffect(() => {
  //   if (!defaultRange) {
  //     onRangeListChange([{ id: nanoid() }]);
  //   }
  // });

  return (
    <>
      {fields.map((range, key) => (
        <div className={lokalStyles.endremaaanedsinntekt} key={range.id}>
          <DatoVelger
            name={`${name}[${key}].fom`}
            // fromDate={fromDate}
            toDate={toDate}
            label={fomTekst}
            // defaultSelected={defaultRange?.fom}
            defaultMonth={defaultMonth}
          />
          <DatoVelger
            name={`${name}[${key}].tom`}
            // fromDate={fromDate}
            label={tomTekst}
            // defaultSelected={defaultRange?.tom}
            toDate={toDate}
            // defaultMonth={defaultMonth || defaultRange?.fom}
          />
          {key > 0 && (
            <ButtonSlette title='Slett periode' onClick={() => remove(key)} className={lokalStyles.sletteknapp} />
          )}
        </div>
      ))}
      <Button variant='secondary' onClick={(event) => append({})} className={lokalStyles.leggtilperiodeknapp}>
        Legg til periode
      </Button>
    </>
  );
}
