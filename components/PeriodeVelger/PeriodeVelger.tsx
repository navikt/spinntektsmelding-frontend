import { Label, Radio, RadioGroup } from '@navikt/ds-react';
import lokalStyle from './PeriodeVelger.module.css';
import { useState } from 'react';
import formatDate from '../../utils/formatDate';
import VisMer from './VisMer';
import slaaSammenPerioder from './slaaSammenPerioder';
import { useController, useFormContext } from 'react-hook-form';
import PeriodeListevelger from '../PeriodeListeVelger/PeriodeListevelger';

interface PeriodeVelgerProps {
  perioder?: { fom: Date; tom: Date; id: string }[];
  perioderSomVises?: number;
}

export default function PeriodeVelger({ perioder, perioderSomVises = 3 }: Readonly<PeriodeVelgerProps>) {
  const { control, setValue } = useFormContext();
  const {
    // field,
    // fieldState: { invalid, isTouched, isDirty },
    formState: { errors }
    // formState: { touchedFields, dirtyFields }
  } = useController({
    name: 'perioder',
    control

    // rules: { required: true },
  });

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);

  const [shownRows, setShownRows] = useState<number>(perioderSomVises);

  const sammenslaatePerioder = perioder ? slaaSammenPerioder(perioder) : [];

  const handleVisMerClick = () => {
    setShownRows(shownRows + perioderSomVises);
  };

  const handleSelectGroup = (val: any) => {
    if (val === 'Annen') {
      setValue('perioder', [{ fom: undefined, tom: undefined, id: 'Annen' }]);
      setSelectedGroup(val);
      return;
    }
    const valg = sammenslaatePerioder.find((p) => p.id === val);
    if (valg && !valg.periode) {
      setValue('perioder', [valg]);
    } else {
      setValue('perioder', valg ? valg.periode : undefined);
    }
    setSelectedGroup(val);
  };

  if (!perioder || perioder.length === 0) {
    return (
      <>
        <Label>Angi periode du vil sende inntektsmelding for</Label>
        <PeriodeListevelger fomTekst='Fra' tomTekst='Til' name='perioder' />
      </>
    );
  }

  return (
    <RadioGroup
      legend='Velg periode du vil sende inntektsmelding for'
      onChange={(val: any) => handleSelectGroup(val)}
      error={errors.perioder?.message as string}
      defaultValue={selectedGroup}
    >
      {sammenslaatePerioder.map((periode, index) => (
        <>
          {index < shownRows && (
            <>
              <Radio value={periode.id}>
                {formatDate(periode.fom)} - {formatDate(periode.tom)}
              </Radio>
              {selectedGroup === periode.id && periode.periode && (
                <>
                  {periode.periode?.map((p) => (
                    <div key={p.id} className={lokalStyle.checkboxContent}>
                      {formatDate(p.fom)} - {formatDate(p.tom)}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </>
      ))}
      {shownRows < sammenslaatePerioder.length && shownRows !== perioder.length && (
        <VisMer onClick={handleVisMerClick} />
      )}

      <Radio value='Annen'>Annen periode</Radio>
      {selectedGroup === 'Annen' && <PeriodeListevelger fomTekst='Fra' tomTekst='Til' name='perioder' />}
    </RadioGroup>
  );
}
