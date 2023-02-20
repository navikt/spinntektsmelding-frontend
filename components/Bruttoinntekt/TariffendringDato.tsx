import Datovelger from '../Datovelger';
import lokalStyles from './Bruttoinntekt.module.css';

interface TariffendringDatoProps {
  changeTariffEndretDato: (newDate: Date | undefined) => void;
  changeTariffKjentDato: (newDate: Date | undefined) => void;
  defaultEndringsdato?: Date;
  defaultKjentDato?: Date;
}

export default function TariffendringDato({
  changeTariffEndretDato,
  changeTariffKjentDato,
  defaultEndringsdato,
  defaultKjentDato
}: TariffendringDatoProps) {
  const tilDato = new Date();
  return (
    <div className={lokalStyles.endremaaanedsinntekt}>
      <Datovelger
        onDateChange={changeTariffEndretDato}
        label='Tariffendring gjelder fra'
        id='bruttoinntekt-tariffendring-fom'
        defaultSelected={defaultEndringsdato}
        toDate={tilDato}
      />

      <Datovelger
        onDateChange={changeTariffKjentDato}
        label='Dato tariffendring ble kjent'
        id='bruttoinntekt-tariffendring-kjelt'
        defaultSelected={defaultKjentDato}
        toDate={tilDato}
      />
    </div>
  );
}
