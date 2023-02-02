import { Button } from '@navikt/ds-react';
import lokalStyles from './PeriodeListevelger.module.css';
import { Periode } from '../../state/state';
import Periodevelger from './Periodevelger';
import { DateRange } from 'react-day-picker';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';

interface PeriodeListevelgerProps {
  onRangeListChange: (dateValue?: Array<Periode>) => void;
  defaultRange?: Array<Periode>;
  fomTekst: string;
  tomTekst: string;
  fomIdBase: string;
  tomIdBase: string;
}

export default function PeriodeListevelger({
  onRangeListChange,
  defaultRange,
  fomTekst,
  tomTekst,
  fomIdBase,
  tomIdBase
}: PeriodeListevelgerProps) {
  const onRangeChange = (datoer: DateRange | undefined, index: string) => {
    const uppdatedRange = defaultRange?.map((periode) => {
      if (periode.id === index) {
        return {
          fom: datoer ? datoer.from : undefined,
          tom: datoer ? datoer.to : undefined,
          id: periode.id
        };
      }
      return periode;
    });

    onRangeListChange(uppdatedRange);
  };

  const slettRad = (periodeId: string) => {
    const uppdatedRange = defaultRange?.filter((periode) => periode.id !== periodeId);
    onRangeListChange(uppdatedRange);
  };

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uppdatedRange = structuredClone(defaultRange);
    uppdatedRange?.push({ id: nanoid() });
    onRangeListChange(uppdatedRange);
  };

  useEffect(() => {
    if (!defaultRange) {
      onRangeListChange([{ id: nanoid() }]);
    }
  });

  return (
    <>
      {defaultRange &&
        defaultRange.map((range, index) => (
          <Periodevelger
            key={range.id}
            onRangeChange={(oppdatertRange) => onRangeChange(oppdatertRange, range.id)}
            defaultRange={range}
            fomTekst={fomTekst}
            fomID={`${fomIdBase}-${range.id}`}
            tomTekst={tomTekst}
            tomID={`${tomIdBase}-${range.id}`}
            kanSlettes={index !== 0}
            periodeId={range.id}
            onSlettRad={slettRad}
          />
        ))}
      <Button variant='secondary' onClick={handleLeggTilPeriode} className={lokalStyles.leggtilperiodeknapp}>
        Legg til periode
      </Button>
    </>
  );
}
