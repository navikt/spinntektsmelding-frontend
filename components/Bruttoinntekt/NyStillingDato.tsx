import Datovelger from '../Datovelger';

interface NyStillingDatoProps {
  onChangeNyStillingEndringsdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
  toDate?: Date;
}

export default function NyStillingDato({ onChangeNyStillingEndringsdato, defaultDate, toDate }: NyStillingDatoProps) {
  const tilDato = toDate ? toDate : new Date();

  return (
    <Datovelger
      onDateChange={onChangeNyStillingEndringsdato}
      label='Ny stilling fra'
      id='bruttoinntekt-nystilling-fom'
      defaultSelected={defaultDate}
      toDate={tilDato}
    />
  );
}
