import { Button, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { FocusEvent, useState } from 'react';
import lokalStyles from './RefusjonArbeidsgiver.module.css';
import styles from '../../styles/Home.module.css';
import stringishToNumber from '../../utils/stringishToNumber';
import RefusjonDatovelger from './RefusjonDatovelger';
import ButtonSlette from '../ButtonSlette';

export interface EndringsBelop {
  belop?: number;
  dato?: Date;
}
interface RefusjonUtbetalingEndringProps {
  endringer: Array<EndringsBelop>;
  minDate?: Date;
  maxDate?: Date;
  onOppdaterEndringer?: (endringer: Array<EndringsBelop>) => void;
  onHarEndringer?: (harEndring: boolean) => void;
}

export default function RefusjonUtbetalingEndring({
  endringer,
  minDate,
  maxDate,
  onOppdaterEndringer,
  onHarEndringer
}: RefusjonUtbetalingEndringProps) {
  const [harEndringer, setHarEndringer] = useState<boolean>(false);
  const oppdaterEndringer = (endringer?: Array<EndringsBelop>): void => {
    if (onOppdaterEndringer) {
      onOppdaterEndringer(endringer || []);
    }
  };

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const tmpEndringer = structuredClone(endringer);
    tmpEndringer.push({});
    oppdaterEndringer(tmpEndringer);
  };
  if (endringer.length === 0) {
    endringer = [{}];
  }

  const changeBelopHandler = (event: FocusEvent<HTMLInputElement>, index: number) => {
    const strBelop = event.currentTarget.value;
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index].belop && !tmpEndringer[index].belop === undefined) {
      tmpEndringer[index] = {
        belop: stringishToNumber(strBelop),
        dato: undefined
      };
    } else tmpEndringer[index].belop = stringishToNumber(strBelop);

    oppdaterEndringer(tmpEndringer);
  };

  const changeDatoHandler = (dato: Date | undefined, index: number) => {
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index].dato && !tmpEndringer[index].dato === undefined) {
      tmpEndringer[index] = {
        belop: undefined,
        dato: dato
      };
    } else tmpEndringer[index].dato = dato;

    oppdaterEndringer(tmpEndringer);
  };

  const changeHarEndringerHandler = (status: string) => {
    setHarEndringer(status === 'Ja');
    if (onHarEndringer) {
      onHarEndringer(status === 'Ja');
    }
  };

  const onSlettClick = (index: number) => {
    const tmpEndringer = structuredClone(endringer);

    const nyeEndringer = tmpEndringer.slice(index, 1);

    oppdaterEndringer(nyeEndringer);
  };

  return (
    <>
      <RadioGroup
        legend='Er det endringer i månedslønn i perioden?'
        id={'lus-utbetaling-endring'}
        className={styles.radiobuttonwrapper}
        // error={visFeilmeldingsTekst('lus-sluttdato-velg')}
        onChange={changeHarEndringerHandler}
        // defaultValue={refusjonskravetOpphoerer?.status}
      >
        <Radio value='Ja'>Ja</Radio>
        <Radio value='Nei'>Nei</Radio>
      </RadioGroup>

      {harEndringer &&
        endringer.map((endring, key) => (
          <div key={key} className={lokalStyles.belopperiode}>
            <TextField
              label='Endret lønn'
              // onChange={(event) => changeBelopHandler(event, key)}
              defaultValue={endring.belop}
              id={`lus-utbetaling-endring-belop-${key}`}
              onBlur={(event) => changeBelopHandler(event, key)}
            />
            <RefusjonDatovelger
              minDate={minDate}
              maxDate={maxDate}
              onDateChange={(val) => changeDatoHandler(val, key)}
              key={key}
            />
            {key !== 0 && (
              <ButtonSlette
                title='Slett periode'
                onClick={() => onSlettClick(key)}
                className={lokalStyles.sletteknapp}
              />
            )}
          </div>
        ))}

      {harEndringer && (
        <Button
          variant='secondary'
          className={lokalStyles.legtilbutton}
          onClick={(event) => handleLeggTilPeriode(event)}
        >
          Legg til periode
        </Button>
      )}
    </>
  );
}
