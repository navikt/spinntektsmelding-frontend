import Datovelger from '../Datovelger';
import { addDays } from 'date-fns';

interface NaturalytelseBortfallsdatoInterface {
  naturalytelseId: string;
  setNaturalytelseBortfallsdato: (naturalytelseId: string, dato?: Date | undefined) => void;
  defaultValue?: Date;
}

export default function NaturalytelseBortfallsdato({
  naturalytelseId,
  setNaturalytelseBortfallsdato,
  defaultValue
}: NaturalytelseBortfallsdatoInterface) {
  const setBortfallsdato = (bortfallsdato: Date | undefined) => {
    setNaturalytelseBortfallsdato(naturalytelseId, bortfallsdato);
  };

  return (
    <Datovelger
      onDateChange={setBortfallsdato}
      label='Dato naturalytelse bortfaller'
      id={'naturalytele-input-fom-dato-' + naturalytelseId}
      hideLabel={true}
      defaultSelected={defaultValue}
    />
  );
}
