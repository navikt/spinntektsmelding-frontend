import { FieldErrors } from 'react-hook-form';
import useBoundStore from '../../state/useBoundStore';
import FeilListe from './FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import z from 'zod/v4';

type HovedSkjema = z.infer<typeof HovedskjemaSchema>;

interface FeilsammendragProps {
  skjemafeil: FieldErrors<HovedSkjema> | undefined;
}

export default function Feilsammendrag({ skjemafeil }: Readonly<FeilsammendragProps>) {
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
