import { Alert, Button, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { MouseEvent, useEffect } from 'react';
import lokalStyling from './RefusjonArbeidsgiver.module.css';
import styles from '../../styles/Home.module.css';
import ButtonSlette from '../ButtonSlette';
import Datovelger from '../Datovelger';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import NumberField from '../NumberField/NumberField';
import stringishToNumber from '../../utils/stringishToNumber';

interface RefusjonUtbetalingEndringProps {
  minDate?: Date;
  maxDate?: Date;
}

export default function RefusjonUtbetalingEndring({ minDate, maxDate }: Readonly<RefusjonUtbetalingEndringProps>) {
  const {
    control,
    watch,
    register,
    formState: { errors }
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'refusjon.endringer'
  });

  const harRefusjonEndringer = watch('refusjon.harEndringer');

  // Legg til en tom rad automatisk når bruker velger "Ja" og det ikke finnes noen rader
  useEffect(() => {
    if (harRefusjonEndringer === 'Ja' && fields.length === 0) {
      append({ beloep: undefined, dato: undefined });
    }

    if (harRefusjonEndringer === 'Nei' && fields.length > 0) {
      remove();
    }
  }, [harRefusjonEndringer, fields.length, append, remove]);

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    append({ beloep: undefined, dato: undefined });
  };

  const onSlettClick = (index: number, e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    remove(index);
  };

  const harEndringerError = findErrorInRHFErrors('refusjon.harEndringer', errors);

  return (
    <>
      <Controller
        name='refusjon.harEndringer'
        control={control}
        render={({ field }) => (
          <RadioGroup
            legend='Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?'
            id={ensureValidHtmlId('refusjon.endringer')}
            className={styles.radiobuttonWrapper}
            error={harEndringerError}
            onChange={field.onChange}
            value={field.value ?? ''}
          >
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </RadioGroup>
        )}
      />
      {harRefusjonEndringer === 'Ja' && (
        <>
          <Alert variant='info' className={lokalStyling.alertBox}>
            Skal arbeidsgiver slutte å forskuttere lønn så kan du sette refusjonen til 0 kr fra den datoen Nav skal ta
            over utbetalingen til den ansatte.
          </Alert>
          {fields.map((field, index) => (
            <div key={field.id} className={lokalStyling.beloepperiode}>
              <NumberField
                label='Endret beløp/måned'
                {...register(`refusjon.endringer.${index}.beloep`, {
                  setValueAs: (value) => stringishToNumber(value)
                })}
                id={ensureValidHtmlId(`refusjon.endringer.${index}.beloep`)}
                error={findErrorInRHFErrors(`refusjon.endringer.${index}.beloep`, errors)}
                className={lokalStyling.endringsboks}
              />
              <Controller
                name={`refusjon.endringer.${index}.startdato`}
                control={control}
                render={({ field: dateField }) => (
                  <Datovelger
                    fromDate={minDate}
                    toDate={maxDate}
                    onDateChange={dateField.onChange}
                    id={ensureValidHtmlId(`refusjon.endringer.${index}.startdato`)}
                    label='Dato for endring'
                    error={findErrorInRHFErrors(`refusjon.endringer.${index}.startdato`, errors)}
                    defaultSelected={dateField.value}
                  />
                )}
              />
              <ButtonSlette
                title='Slett periode'
                onClick={(e) => onSlettClick(index, e)}
                className={lokalStyling.sletteknapp}
              />
            </div>
          ))}
        </>
      )}

      {harRefusjonEndringer === 'Ja' && (
        <Button
          variant='secondary'
          className={lokalStyling.legtilbutton}
          onClick={(event) => handleLeggTilPeriode(event)}
        >
          Legg til periode
        </Button>
      )}
    </>
  );
}
