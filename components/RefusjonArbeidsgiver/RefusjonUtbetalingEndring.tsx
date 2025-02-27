import { Alert, Button, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { ChangeEvent, MouseEvent } from 'react';
import lokalStyles from './RefusjonArbeidsgiver.module.css';
import styles from '../../styles/Home.module.css';
import stringishToNumber from '../../utils/stringishToNumber';
import ButtonSlette from '../ButtonSlette';
import Datovelger from '../Datovelger';
import useBoundStore from '../../state/useBoundStore';
import { YesNo } from '../../state/state';

export interface EndringsBeloep {
  beloep?: number;
  dato?: Date;
}
interface RefusjonUtbetalingEndringProps {
  endringer: Array<EndringsBeloep>;
  minDate?: Date;
  maxDate?: Date;
  harRefusjonEndringer?: YesNo;
  harRefusjonEndringerDefault?: YesNo;
  onOppdaterEndringer?: (endringer: Array<EndringsBeloep>) => void;
  onHarEndringer?: (harEndring: YesNo) => void;
}

export default function RefusjonUtbetalingEndring({
  endringer,
  minDate,
  maxDate,
  onOppdaterEndringer,
  onHarEndringer,
  harRefusjonEndringer,
  harRefusjonEndringerDefault
}: Readonly<RefusjonUtbetalingEndringProps>) {
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const oppdaterEndringer = (endringer?: Array<EndringsBeloep>): void => {
    if (onOppdaterEndringer) {
      onOppdaterEndringer(endringer ?? []);
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
    event.preventDefault();
    const strBelop = event.currentTarget.value;
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index]) {
      tmpEndringer[index] = {
        beloep: stringishToNumber(strBelop),
        dato: undefined
      };
    } else tmpEndringer[index].beloep = stringishToNumber(strBelop);

    oppdaterEndringer(tmpEndringer);
  };

  const changeDatoHandler = (dato: Date | undefined, index: number) => {
    const tmpEndringer = structuredClone(endringer);

    if (!tmpEndringer[index]) {
      tmpEndringer[index] = {
        beloep: undefined,
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

  const onSlettClick = (index: number, e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const tmpEndringer = structuredClone(endringer);
    tmpEndringer.splice(index, 1);
    oppdaterEndringer(tmpEndringer);
  };

  return (
    <>
      <RadioGroup
        legend='Er det endringer i refusjonsbeløpet i perioden?'
        id={'refusjon.endringer'}
        className={styles.radiobuttonWrapper}
        error={visFeilmeldingTekst('refusjon.endringer')}
        onChange={changeHarEndringerHandler}
        defaultValue={harRefusjonEndringerDefault}
      >
        <Radio value='Ja'>Ja</Radio>
        <Radio value='Nei'>Nei</Radio>
      </RadioGroup>
      {harRefusjonEndringer === 'Ja' && (
        <>
          <Alert variant='info' className={lokalStyles.alertBox}>
            Skal arbeidsgiver slutte å forskuttere lønn så kan du sette refusjonen til 0 kr fra den datoen Nav skal ta
            over utbetalingen til den ansatte.
          </Alert>
          {endringer.map((endring, key) => (
            <div key={endring.dato ? endring.dato.toUTCString() : key} className={lokalStyles.beloepperiode}>
              <TextField
                label='Endret beløp/måned'
                onChange={(event) => changeBelopHandler(event, key)}
                defaultValue={endring.beloep ?? ''}
                id={`refusjon.refusjonEndringer[${key}].beløp`}
                error={visFeilmeldingTekst(`refusjon.refusjonEndringer[${key}].beløp`)}
                className={lokalStyles.endringsboks}
              />
              <Datovelger
                fromDate={minDate}
                toDate={maxDate}
                onDateChange={(val: Date | undefined) => changeDatoHandler(val, key)}
                id={`refusjon.refusjonEndringer[${key}].dato`}
                label='Dato for endring'
                error={visFeilmeldingTekst(`refusjon.refusjonEndringer[${key}].dato`)}
                defaultSelected={endring.dato}
              />
              <ButtonSlette
                title='Slett periode'
                onClick={(e) => onSlettClick(key, e)}
                className={lokalStyles.sletteknapp}
              />
            </div>
          ))}
        </>
      )}

      {harRefusjonEndringer === 'Ja' && (
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
