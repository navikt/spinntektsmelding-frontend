import { Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from './SelectNaturalytelser/SelectNaturalytelser';
import lokalStyles from './Naturalytelser.module.css';

import styles from '../../styles/Home.module.css';
import formatCurrency from '../../utils/formatCurrency';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import DatoVelger from '../DatoVelger/DatoVelger';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import stringishToNumber from '../../utils/stringishToNumber';

export default function Naturalytelser() {
  // const naturalytelser = useBoundStore((state) => state.naturalytelser);
  // const leggTilNaturalytelse = useBoundStore((state) => state.leggTilNaturalytelse);
  // const setNaturalytelseType = useBoundStore((state) => state.setNaturalytelseType);
  // const setNaturalytelseBortfallsdato = useBoundStore((state) => state.setNaturalytelseBortfallsdato);
  // const setNaturalytelseVerdi = useBoundStore((state) => state.setNaturalytelseVerdi);
  // const slettNaturalytelse = useBoundStore((state) => state.slettNaturalytelse);
  // const slettAlleNaturalytelser = useBoundStore((state) => state.slettAlleNaturalytelser);
  // const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);

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
  const naturalytelser = watch('inntekt.naturalytelser');

  console.log('fields', fields, naturalytelser);
  console.log('errors', errors);

  useEffect(() => {
    if (harBortfallAvNaturalytelser) {
      console.log('replace');
      replace([dummyYtelse]);
    } else {
      console.log('remove');
      remove();
    }
  }, [dummyYtelse, harBortfallAvNaturalytelser, remove, replace]);

  useEffect(() => {
    if ((!fields || fields.length === 0) && harBortfallAvNaturalytelser) {
      console.log('replace 2');
      replace([dummyYtelse]);
    }
  }, [fields, replace, harBortfallAvNaturalytelser, dummyYtelse]);

  return (
    <>
      <Heading3>Naturalytelser</Heading3>
      <Checkbox
        // value='Naturalytelser'
        // onClick={visNaturalytelser}
        // checked={checkedNaturalytelser}
        {...register('inntekt.harBortfallAvNaturalytelser')}
      >
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

                  <td className={styles.tddatepickernatural}>
                    <DatoVelger name={`inntekt.naturalytelser.${index}.sluttdato`} />
                  </td>

                  <td>
                    <TextField
                      label={''}
                      className={styles.fnr}
                      // onChange={(event) => setNaturalytelseVerdi(element.id, event.target.value)}
                      // defaultValue={element.verdi ? formatCurrency(element.verdi) : undefined}
                      error={findErrorInRHFErrors(`inntekt.naturalytelser.${index}.verdiBeloep`, errors)}
                      {...register(`inntekt.naturalytelser.${index}.verdiBeloep`, {
                        setValueAs: (value) => stringishToNumber(value)
                      })}
                    />
                  </td>
                  <td>
                    <ButtonSlette onClick={() => remove(index)} title='Slett ytelse' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={lokalStyles.naturalytelserknapp}>
            <Button variant='secondary' className={styles.legtilbutton} onClick={(e) => append({ ...dummyYtelse })}>
              Legg til naturalytelse
            </Button>
          </div>
        </>
      )}
    </>
  );
}
