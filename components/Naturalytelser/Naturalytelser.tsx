import { Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from './SelectNaturalytelser/SelectNaturalytelser';
import lokalStyles from './Naturalytelser.module.css';

import styles from '../../styles/Home.module.css';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import DatoVelger from '../DatoVelger/DatoVelger';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import stringishToNumber from '../../utils/stringishToNumber';

export default function Naturalytelser() {
  const {
    control,
    register,
    watch,
    formState: { errors }
  } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'inntekt.naturalytelser'
  });

  const dummyYtelse = useMemo(() => ({ naturalytelse: '', sluttdato: undefined, verdiBeloep: '' }), []);

  const harBortfallAvNaturalytelser = watch('inntekt.harBortfallAvNaturalytelser');

  useEffect(() => {
    if (harBortfallAvNaturalytelser) {
      if (fields.length === 0) {
        replace([dummyYtelse]);
      }
    } else {
      remove();
    }
  }, [dummyYtelse, harBortfallAvNaturalytelser, remove, replace, fields.length]);

  const handleButtonSletteClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    remove(index);
  };

  const handleButtonLeggTilClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    append({ ...dummyYtelse });
  };

  return (
    <>
      <Heading3>Naturalytelser</Heading3>
      <Checkbox {...register('inntekt.harBortfallAvNaturalytelser')}>
        Har den ansatte naturalytelser som faller bort under sykefraværet?
      </Checkbox>
      {harBortfallAvNaturalytelser && (
        <>
          <table className={lokalStyles.tablenaturalytelse}>
            <thead>
              <tr>
                <th>Naturalytelse</th>
                <th>Dato naturalytelse faller bort</th>
                <th>Verdi naturalytelse - kr/måned</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((element, index) => (
                <tr key={element.id}>
                  <td>
                    <SelectNaturalytelser name={`inntekt.naturalytelser.${index}.naturalytelse`} />
                  </td>

                  <td className={lokalStyles.tddatepickernatural}>
                    <DatoVelger name={`inntekt.naturalytelser.${index}.sluttdato`} />
                  </td>

                  <td>
                    <TextField
                      label={''}
                      className={styles.fnr}
                      error={findErrorInRHFErrors(`inntekt.naturalytelser.${index}.verdiBeloep`, errors)}
                      {...register(`inntekt.naturalytelser.${index}.verdiBeloep`, {
                        setValueAs: (value) => stringishToNumber(value)
                      })}
                    />
                  </td>
                  <td>
                    {index > 0 && (
                      <ButtonSlette onClick={(e) => handleButtonSletteClick(e, index)} title='Slett ytelse' />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={lokalStyles.naturalytelserknapp}>
            <Button variant='secondary' className={styles.legtilbutton} onClick={handleButtonLeggTilClick}>
              Legg til naturalytelse
            </Button>
          </div>
        </>
      )}
    </>
  );
}
