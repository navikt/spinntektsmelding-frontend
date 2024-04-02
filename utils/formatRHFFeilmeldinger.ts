import { Feilmelding } from '../components/Feilsammendrag/FeilListe';

export default function formatRHFFeilmeldinger(validationResult: any): Feilmelding[] {
  let seen: any[] = [];
  const errorObject = JSON.parse(
    JSON.stringify(validationResult, function (key, val) {
      if (val != null && typeof val == 'object') {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    })
  );

  return traverseAndFindMessages(errorObject);
}

function traverseAndFindMessages(obj: any, path: string[] = []): Feilmelding[] {
  let messages: Feilmelding[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newPath = path.concat(key);
      if (typeof obj[key] === 'object' && key !== 'ref') {
        messages = messages.concat(traverseAndFindMessages(obj[key], newPath));
      } else if (key === 'message') {
        messages.push({
          text: obj[key],
          felt: newPath.join('.')
        } as Feilmelding);
      }
    }
  }
  return messages;
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
