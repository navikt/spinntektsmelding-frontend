import { Button } from '@navikt/ds-react';
import Periodevelger from './Periodevelger';
import lokalStyles from './Bruttoinntekt.module.css';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';

interface FerieULonnDatoProps {
  onFerieRangeListChange: (dateValue?: Array<Periode>) => void;
  defaultRange: Array<Periode> | undefined;
}

export default function FerieULonnDato({ onFerieRangeListChange, defaultRange }: FerieULonnDatoProps) {
  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uppdatedRange = structuredClone(defaultRange);
    uppdatedRange?.push({ id: nanoid() });
    onFerieRangeListChange(uppdatedRange);
  };

  const onFerieRangeChange = (datoer: DateRange | undefined, index: string) => {
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

    onFerieRangeListChange(uppdatedRange);
  };

  const slettRad = (periodeId: string) => {
    const uppdatedRange = defaultRange?.filter((periode) => periode.id !== periodeId);
    onFerieRangeListChange(uppdatedRange);
  };

  useEffect(() => {
    if (!defaultRange) {
      onFerieRangeListChange([{ id: nanoid() }]);
    }
  });

  return (
    <>
      {defaultRange &&
        defaultRange.map((range, index) => (
          <Periodevelger
            key={range.id}
            onRangeChange={(oppdatertRange) => onFerieRangeChange(oppdatertRange, range.id)}
            defaultRange={range}
            fomTekst='Fra dato ferie'
            fomID='bruttoinntekt-ful-fom'
            tomTekst='Til dato ferie'
            tomID='bruttoinntekt-ful-tom'
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
