import BaseDatePicker from './DatoVelger/BaseDatePicker';

interface DatovelgerProps {
  onDateChange?: (val?: Date | undefined) => void;
  defaultSelected?: Date;
  toDate?: Date;
  fromDate?: Date;
  id?: string;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  error?: React.ReactNode;
}

export default function Datovelger({
  onDateChange,
  defaultSelected,
  toDate,
  fromDate,
  id,
  label,
  hideLabel,
  disabled,
  defaultMonth,
  error
}: Readonly<DatovelgerProps>) {
  return (
    <BaseDatePicker
      defaultSelected={defaultSelected}
      toDate={toDate}
      fromDate={fromDate}
      id={id}
      label={label}
      hideLabel={hideLabel}
      disabled={disabled}
      defaultMonth={defaultMonth}
      error={error}
      onDateChange={onDateChange}
    />
  );
}
