import { Button } from '@navikt/ds-react';
import lokalStyles from './PeriodeListevelger.module.css';
import { Periode } from '../../state/state';
import Periodevelger, { PeriodeParam } from './Periodevelger';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';

interface PeriodeListevelgerProps {
  onRangeListChange: (dateValue?: Array<Periode>) => void;
  defaultRange?: Array<Periode>;
  fomTekst: string;
  tomTekst: string;
  fomIdBase: string;
  tomIdBase: string;
  defaultMonth?: Date;
  toDate?: Date;
  visFeilmeldingTekst?: (feilmelding: string) => string;
}

export default function PeriodeListevelger({
  onRangeListChange,
  defaultRange,
  fomTekst,
  tomTekst,
  fomIdBase,
  tomIdBase,
  defaultMonth,
  toDate,
  visFeilmeldingTekst
}: Readonly<PeriodeListevelgerProps>) {
  const onRangeChange = (endretPeriode: PeriodeParam | undefined, index: string) => {
    const updatedRange = defaultRange?.map(
      (periode) => {
        if (periode.id === index) {
          return {
            fom: endretPeriode ? endretPeriode.fom : undefined,
            tom: endretPeriode ? endretPeriode.tom : undefined,
            id: periode.id
          };
        }
        return periode;
      },
      [defaultRange, onRangeListChange]
    );

    onRangeListChange(updatedRange);
  };

  const slettRad = (periodeId: string | number) => {
    const updatedRange = defaultRange?.filter((periode) => periode.id !== periodeId);
    onRangeListChange(updatedRange);
  };

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const updatedRange = structuredClone(defaultRange);
    updatedRange?.push({ id: nanoid() });
    onRangeListChange(updatedRange);
  };

  useEffect(() => {
    if (!defaultRange) {
      onRangeListChange([{ id: nanoid() }]);
    }
  });
  return (
    <>
      {defaultRange?.map((range, index) => (
        <Periodevelger
          key={`${fomIdBase}-${range.id}`}
          onRangeChange={(oppdatertRange) => onRangeChange(oppdatertRange, range.id)}
          defaultRange={range}
          fomTekst={fomTekst}
          fomID={`${fomIdBase}-${range.id}`}
          tomTekst={tomTekst}
          tomID={`${tomIdBase}-${range.id}`}
          kanSlettes={index !== 0}
          periodeId={range.id}
          onSlettRad={slettRad}
          fomError={visFeilmeldingTekst ? visFeilmeldingTekst(`${fomIdBase}-${range.id}`) : undefined}
          tomError={visFeilmeldingTekst ? visFeilmeldingTekst(`${tomIdBase}-${range.id}`) : undefined}
          defaultMonth={defaultMonth}
          toDate={toDate}
        />
      ))}
      <Button variant='secondary' onClick={handleLeggTilPeriode} className={lokalStyles.leggTilPeriodeKnapp}>
        Legg til periode
      </Button>
    </>
  );
}
