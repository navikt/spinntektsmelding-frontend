import { SafeParseReturnType } from 'zod';
import { Feilmelding } from '../components/Feilsammendrag/FeilListe';
export default function formatRHFFeilmeldinger(validationResult: any): Feilmelding[] {
  const fmKeys = Object.keys(validationResult);
  if (fmKeys.length === 0) {
    return [];
  }

  return fmKeys.map((feil) => {
    return {
      text: validationResult[feil].message,
      felt: feil
    } as Feilmelding;
  });
}
