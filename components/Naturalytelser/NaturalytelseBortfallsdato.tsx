import Datovelger from '../Datovelger';

interface NaturalytelseBortfallsdatoInterface {
  naturalytelseId: string;
  setNaturalytelseBortfallsdato: (naturalytelseId: string, dato?: Date | undefined) => void;
  defaultValue?: Date;
  error?: React.ReactNode;
}

export default function NaturalytelseBortfallsdato({
  naturalytelseId,
  setNaturalytelseBortfallsdato,
  defaultValue,
  error
}: Readonly<NaturalytelseBortfallsdatoInterface>) {
  const setBortfallsdato = (bortfallsdato: Date | undefined) => {
    setNaturalytelseBortfallsdato(naturalytelseId, bortfallsdato);
  };

  return (
    <Datovelger
      onDateChange={setBortfallsdato}
      label='Dato naturalytelse bortfaller'
      id={'naturalytele-dato-' + naturalytelseId}
      hideLabel={true}
      defaultSelected={defaultValue}
      error={error}
    />
  );
}
