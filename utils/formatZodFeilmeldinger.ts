import { SafeParseReturnType } from 'zod';
import { Feilmelding } from '../components/Feilsammendrag/FeilListe';
export default function formatZodFeilmeldinger(validationResult: SafeParseReturnType<any, any>): Feilmelding[] {
  if (validationResult.success) {
    return [];
  }

  const formaterteFeilmeldinger = validationResult.error.format();
  return Object.keys(formaterteFeilmeldinger)
    .filter((feil) => feil !== '_errors')
    .map((feil) => {
      return {
        text: formaterteFeilmeldinger[feil as keyof typeof formaterteFeilmeldinger]._errors.join(', '),
        felt: feil
      } as Feilmelding;
    });
}
