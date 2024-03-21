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
export function getAllKeysAsString(main: any): string {
  const obj = structuredClone(main);
  let keys: string[] = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      console.log('key', key);
      keys = keys.concat(getAllKeysAsString(obj[key]));
    } else {
      keys.push(key);
    }
  }
  return keys.join(', ');
}
