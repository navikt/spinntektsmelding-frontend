import { Button } from '@navikt/ds-react';
import lokalStyles from './PeriodeListevelger.module.css';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import ButtonSlette from '../ButtonSlette';
import { useEffect } from 'react';
import parseIsoDate from '../../utils/parseIsoDate';

interface PeriodeListevelgerProps {
  defaultRange?: Array<{ fom: string | Date; tom: string | Date }>;
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
}: Readonly<PeriodeListevelgerProps>) {
  const { control } = useFormContext();

  const {
    fields,
    append: leggTilPeriode,
    remove: slettPeriode,
    replace: erstattPeriode
  } = useFieldArray({
    control,
    name
  });

  useEffect(() => {
    if (defaultRange && defaultRange.length > 0) {
      defaultRange.forEach((range, index) => {
        if (index === 0) {
          erstattPeriode({ fom: parseIsoDate(range.fom), tom: parseIsoDate(range.tom) });
        } else {
          leggTilPeriode({ fom: parseIsoDate(range.fom), tom: parseIsoDate(range.tom) });
        }
      });
    }
  }, [leggTilPeriode, defaultRange, erstattPeriode]);

  useEffect(() => {
    if (fields.length === 0) {
      erstattPeriode({});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault();
    leggTilPeriode({});
  };
  let toDateTomVisning: Date | undefined = toDateTom;

  if (!toDateTom && toDate && !toDateTomFri) {
    toDateTomVisning = toDate;
  }

  toDateTomVisning = undefined;

  return (
    <>
      {fields.map((range, key) => (
        <div className={lokalStyles.endremaaanedsinntekt} key={range.id}>
          <DatoVelger name={`${name}.${key}.fom`} toDate={toDate} label={fomTekst} defaultMonth={defaultMonth} />
          <DatoVelger
            name={`${name}.${key}.tom`}
            label={tomTekst}
            toDate={toDateTomVisning}
            defaultMonth={defaultMonth}
          />
          {key > 0 && (
            <ButtonSlette title='Slett periode' onClick={() => slettPeriode(key)} className={lokalStyles.sletteknapp} />
          )}
        </div>
      ))}
      <Button variant='secondary' onClick={handleLeggTilPeriode} className={lokalStyles.leggtilperiodeknapp}>
        Legg til periode
      </Button>
    </>
  );
}
