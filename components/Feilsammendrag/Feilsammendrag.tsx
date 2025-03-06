import { FieldError, UseControllerProps, FieldErrors, FieldValues } from 'react-hook-form';
import useBoundStore from '../../state/useBoundStore';
import FeilListe from './FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

interface FeilsammendragProps<T> extends UseControllerProps<T> {
  skjemafeil: FieldError[] | undefined;
}

export default function Feilsammendrag({ skjemafeil }: Readonly<FeilsammendragProps<any>>) {
  const feil = formatRHFFeilmeldinger(skjemafeil);

  const feilmeldinger = useBoundStore((state) => state.feilmeldinger);
  const skalViseFeilmeldinger = useBoundStore((state) => state.skalViseFeilmeldinger);

  const combinedFeilmeldinger = [...feilmeldinger, ...feil];

  const harFeilmeldinger = combinedFeilmeldinger && combinedFeilmeldinger.length > 0;
  if (!harFeilmeldinger) return null;

  return (
    <FeilListe
      feilmeldinger={combinedFeilmeldinger}
      skalViseFeilmeldinger={skalViseFeilmeldinger || combinedFeilmeldinger.length > 0}
    />
  );
}
