import lokalStyles from '../Bruttoinntekt/Bruttoinntekt.module.css';
import DatoVelger from '../DatoVelger/DatoVelger';

interface TariffendringDatoProps {
  defaultEndringsdato?: Date;
  defaultKjentDato?: Date;
  defaultMonth?: Date;
}

export default function TariffendringDato({
  defaultEndringsdato,
  defaultKjentDato,
  defaultMonth
}: TariffendringDatoProps) {
  const tilDato = new Date();
  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <DatoVelger
        label='Tariffendring gjelder fra'
        defaultSelected={defaultEndringsdato}
        toDate={tilDato}
        defaultMonth={defaultMonth}
        name='inntekt.endringAarsak.gjelderFra'
      />

      <DatoVelger
        label='Dato tariffendring ble kjent'
        defaultSelected={defaultKjentDato}
        toDate={tilDato}
        defaultMonth={defaultMonth}
        name='inntekt.endringAarsak.bleKjent'
      />
    </div>
  );
}
