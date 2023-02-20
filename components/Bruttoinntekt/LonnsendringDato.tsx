import Datovelger from '../Datovelger';

interface LonnsendringDatoProps {
  onChangeLonnsendringsdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
  toDate?: Date;
}

export default function LonnsendringDato({ onChangeLonnsendringsdato, defaultDate, toDate }: LonnsendringDatoProps) {
  const tilDato = toDate ? toDate : new Date();
  return (
    <Datovelger
      onDateChange={onChangeLonnsendringsdato}
      label='Lønnsendring gjelder fra'
      id='bruttoinntekt-lonnsendring-fom'
      defaultSelected={defaultDate}
      toDate={tilDato}
    />
  );
}
