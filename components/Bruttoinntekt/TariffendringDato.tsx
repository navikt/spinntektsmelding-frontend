import Datovelger from '../Datovelger';
import lokalStyles from './Bruttoinntekt.module.css';

interface TariffendringDatoProps {
  changeTariffEndretDato: (newDate: Date | undefined) => void;
  changeTariffKjentDato: (newDate: Date | undefined) => void;
  defaultEndringsdato?: Date;
  defaultKjentDato?: Date;
  defaultMonth?: Date;
  visFeilmeldingTekst?: (feilmelding: string) => string;
}

export default function TariffendringDato({
  changeTariffEndretDato,
  changeTariffKjentDato,
  defaultEndringsdato,
  defaultKjentDato,
  defaultMonth,
  visFeilmeldingTekst
}: Readonly<TariffendringDatoProps>) {
  const tilDato = new Date();
  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <Datovelger
        onDateChange={changeTariffEndretDato}
        label='Tariffendring gjelder fra'
        id='bruttoinntekt-tariffendring-fom'
        defaultSelected={defaultEndringsdato}
        toDate={tilDato}
        error={visFeilmeldingTekst ? visFeilmeldingTekst('bruttoinntekt-tariffendring-fom') : undefined}
        defaultMonth={defaultMonth}
      />

      <Datovelger
        onDateChange={changeTariffKjentDato}
        label='Dato tariffendring ble kjent'
        id='bruttoinntekt-tariffendring-kjent'
        defaultSelected={defaultKjentDato}
        toDate={tilDato}
        error={visFeilmeldingTekst ? visFeilmeldingTekst('bruttoinntekt-tariffendring-kjent') : undefined}
        defaultMonth={defaultMonth}
      />
    </div>
  );
}
