import { Feilmelding } from '../components/Feilsammendrag/FeilListe';

export default function formatRHFFeilmeldinger(validationResult: any): Feilmelding[] {
  let seen: any[] = [];

  if (!validationResult || typeof validationResult !== 'object') {
    return [];
  }

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
      } else if ((key === 'message' || key === 'error') && typeof obj[key] === 'string') {
        messages.push({
          text: obj['error'] ?? obj['message'],
          felt: path.join('.')
        } as Feilmelding);
      }
    }
  }
  return messages;
}
