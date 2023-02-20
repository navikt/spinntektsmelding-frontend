import Datovelger from '../Datovelger';

interface NyStillingsprosentDatoProps {
  onChangeNyStillingsprosentdato: (newDate: Date | undefined) => void;
  defaultDate?: Date;
  toDate?: Date;
}

export default function NyStillingsprosentDato({
  onChangeNyStillingsprosentdato,
  defaultDate,
  toDate
}: NyStillingsprosentDatoProps) {
  const tilDato = toDate ? toDate : new Date();

  return (
    <Datovelger
      onDateChange={onChangeNyStillingsprosentdato}
      label='Ny stillingsprosent fra'
      id='bruttoinntekt-nystillingsprosent-fom'
      defaultSelected={defaultDate}
      toDate={tilDato}
    />
  );
}
