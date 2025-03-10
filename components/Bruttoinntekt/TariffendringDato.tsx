import DatoVelger from '../DatoVelger/DatoVelger';
import lokalStyles from './Bruttoinntekt.module.css';

interface TariffendringDatoProps {
  defaultEndringsdato?: Date;
  defaultKjentDato?: Date;
  defaultMonth?: Date;
  name: string;
}

export default function TariffendringDato({
  defaultEndringsdato,
  defaultKjentDato,
  defaultMonth,
  name
}: Readonly<TariffendringDatoProps>) {
  const tilDato = new Date();
  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <DatoVelger
        // onDateChange={changeTariffEndretDato}
        label='Tariffendring gjelder fra'
        // id='bruttoinntekt-tariffendring-fom'
        defaultSelected={defaultEndringsdato}
        toDate={tilDato}
        // error={visFeilmeldingTekst ? visFeilmeldingTekst('bruttoinntekt-tariffendring-fom') : undefined}
        defaultMonth={defaultMonth}
        name={`${name}.gjelderFra`}
      />

      <DatoVelger
        // onDateChange={changeTariffKjentDato}
        label='Dato tariffendring ble kjent'
        // id='bruttoinntekt-tariffendring-kjent'
        defaultSelected={defaultKjentDato}
        toDate={tilDato}
        // error={visFeilmeldingTekst ? visFeilmeldingTekst('bruttoinntekt-tariffendring-kjent') : undefined}
        defaultMonth={defaultMonth}
        name={`${name}.bleKjent`}
      />
    </div>
  );
}
