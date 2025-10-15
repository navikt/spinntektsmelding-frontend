import { FieldErrors } from 'react-hook-form';
import useBoundStore from '../../state/useBoundStore';
import FeilListe from './FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import { z } from 'zod';
import { dedupeFeilmeldinger } from '../../utils/dedupeFeilmeldinger';

type HovedSkjema = z.infer<typeof HovedskjemaSchema>;

interface FeilsammendragProps {
  skjemafeil: FieldErrors<HovedSkjema> | undefined;
}

export default function Feilsammendrag({ skjemafeil }: Readonly<FeilsammendragProps>) {
  const feil = formatRHFFeilmeldinger(skjemafeil);

  const feilmeldinger = useBoundStore((state) => state.feilmeldinger);
  const skalViseFeilmeldinger = useBoundStore((state) => state.skalViseFeilmeldinger);

  const combinedFeilmeldinger = dedupeFeilmeldinger([...feilmeldinger, ...feil]);

  const harFeilmeldinger = combinedFeilmeldinger && combinedFeilmeldinger.length > 0;
  if (!harFeilmeldinger) return null;

  console.log('combinedFeilmeldinger', combinedFeilmeldinger);

  return (
    <FeilListe
      feilmeldinger={combinedFeilmeldinger}
      skalViseFeilmeldinger={skalViseFeilmeldinger || combinedFeilmeldinger.length > 0}
    />
  );
}
