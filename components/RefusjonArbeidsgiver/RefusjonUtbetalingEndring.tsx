import { Button, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { ChangeEvent } from 'react';
import lokalStyles from './RefusjonArbeidsgiver.module.css';
import styles from '../../styles/Home.module.css';
import stringishToNumber from '../../utils/stringishToNumber';
import ButtonSlette from '../ButtonSlette';
import Datovelger from '../Datovelger';
import useBoundStore from '../../state/useBoundStore';
import { YesNo } from '../../state/state';

export interface EndringsBelop {
  belop?: number;
  dato?: Date;
}
interface RefusjonUtbetalingEndringProps {
  endringer: Array<EndringsBelop>;
  minDate?: Date;
  maxDate?: Date;
  harRefusjonEndring?: YesNo;
  onOppdaterEndringer?: (endringer: Array<EndringsBelop>) => void;
  onHarEndringer?: (harEndring: YesNo) => void;
}

export default function RefusjonUtbetalingEndring({
  endringer,
  minDate,
  maxDate,
  onOppdaterEndringer,
  onHarEndringer,
  harRefusjonEndring
}: RefusjonUtbetalingEndringProps) {
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
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

  const changeBelopHandler = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const strBelop = event.currentTarget.value;
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index].belop && typeof tmpEndringer[index].belop !== 'undefined') {
      tmpEndringer[index] = {
        belop: stringishToNumber(strBelop),
        dato: undefined
      };
    } else tmpEndringer[index].belop = stringishToNumber(strBelop);

    oppdaterEndringer(tmpEndringer);
  };

  const changeDatoHandler = (dato: Date | undefined, index: number) => {
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index].dato && tmpEndringer[index].dato !== undefined) {
      tmpEndringer[index] = {
        belop: undefined,
        dato: dato
      };
    } else tmpEndringer[index].dato = dato;

    oppdaterEndringer(tmpEndringer);
  };

  const changeHarEndringerHandler = (status: string) => {
    if (onHarEndringer) {
      onHarEndringer(status as YesNo);
    }
  };

  const onSlettClick = (index: number) => {
    const tmpEndringer = structuredClone(endringer);
    tmpEndringer.splice(index, 1);
    oppdaterEndringer(tmpEndringer);
  };

  return (
    <>
      <RadioGroup
        legend='Er det endringer i refusjonsbeløpet i perioden?'
        id={'lus-utbetaling-endring-radio'}
        className={styles.radiobuttonwrapper}
        error={visFeilmeldingsTekst('lus-utbetaling-endring-radio')}
        onChange={changeHarEndringerHandler}
        defaultValue={harRefusjonEndring}
      >
        <Radio value='Ja'>Ja</Radio>
        <Radio value='Nei'>Nei</Radio>
      </RadioGroup>

      {harRefusjonEndring === 'Ja' &&
        endringer.map((endring, key) => (
          <div key={key} className={lokalStyles.belopperiode}>
            <TextField
              label='Endret refusjon/måned'
              onChange={(event) => changeBelopHandler(event, key)}
              defaultValue={endring.belop}
              id={`lus-utbetaling-endring-belop-${key}`}
              error={visFeilmeldingsTekst(`lus-utbetaling-endring-belop-${key}`)}
            />
            <Datovelger
              fromDate={minDate}
              toDate={maxDate}
              onDateChange={(val: Date | undefined) => changeDatoHandler(val, key)}
              id={`lus-utbetaling-endring-dato-${key}`}
              label='Dato for endring'
              error={visFeilmeldingsTekst(`lus-utbetaling-endring-dato-${key}`)}
              defaultSelected={endring.dato}
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

      {harRefusjonEndring === 'Ja' && (
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
