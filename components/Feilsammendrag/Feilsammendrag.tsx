import { FieldErrors } from 'react-hook-form';
import useBoundStore from '../../state/useBoundStore';
import FeilListe from './FeilListe';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import { z } from 'zod';

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

  return (
    <FeilListe
      feilmeldinger={combinedFeilmeldinger}
      skalViseFeilmeldinger={skalViseFeilmeldinger || combinedFeilmeldinger.length > 0}
    />
  );
}

function dedupeFeilmeldinger<T>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((entry) => {
    if (entry == null) return false;
    // Støtt både streng og objekt
    if (typeof entry === 'string') {
      if (seen.has(entry)) return false;
      seen.add(entry);
      return true;
    }
    // Forventet shape { felt?: string; text?: string }
    // Lag en stabil nøkkel – fall tilbake til JSON.stringify
    const felt = (entry as any).felt;
    const text = (entry as any).text;
    const key =
      typeof felt === 'string' || typeof text === 'string' ? `${felt ?? ''}::${text ?? ''}` : JSON.stringify(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
