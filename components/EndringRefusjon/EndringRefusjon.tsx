import { Button, TextField } from '@navikt/ds-react';

import lokalStyles from '../RefusjonArbeidsgiver/RefusjonArbeidsgiver.module.css';
import stringishToNumber from '../../utils/stringishToNumber';
import ButtonSlette from '../ButtonSlette';

import OrdinaryJaNei from '../OrdinaryJaNei/OrdinaryJaNei';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';

export interface EndringsBelop {
  belop?: number;
  dato?: Date;
}
interface EndringRefusjonProps {
  minDate?: Date;
  maxDate?: Date;
}

export default function EndringRefusjon({ minDate, maxDate }: Readonly<EndringRefusjonProps>) {
  const {
    formState: { errors },
    watch,
    getValues,
    control,
    register
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'refusjon.refusjonEndringer' // unique name for your Field Array
  });

  let harEndringRefusjon = watch('refusjon.harEndringer');
  if (harEndringRefusjon === undefined) {
    harEndringRefusjon = getValues('refusjon.harEndringer');
  }

  return (
    <>
      <OrdinaryJaNei legend='Er det endringer i refusjonsbeløpet i perioden?' name={'refusjon.harEndringer'} />

      {harEndringRefusjon === 'Ja' &&
        fields.map((endring, key) => (
          <div key={endring.id} className={lokalStyles.belopperiode}>
            <TextField
              label='Endret refusjon/måned'
              error={errors.refusjon?.refusjonEndringer?.[key]?.beloep?.message as string}
              className={lokalStyles.endringsboks}
              {...register(`refusjon.refusjonEndringer.${key}.beloep` as const, {
                setValueAs: (value) => stringishToNumber(value)
              })}
            />
            <DatoVelger
              fromDate={minDate}
              toDate={maxDate}
              label='Dato for endring'
              defaultSelected={endring.dato}
              name={`refusjon.refusjonEndringer.${key}.dato`}
            />
            <ButtonSlette title='Slett periode' onClick={() => remove(key)} className={lokalStyles.sletteknapp} />
          </div>
        ))}

      {harEndringRefusjon === 'Ja' && (
        <Button variant='secondary' className={lokalStyles.legtilbutton} onClick={(event) => append({})}>
          Legg til periode
        </Button>
      )}
    </>
  );
}
