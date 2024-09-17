import { parseISO } from 'date-fns';

export default function parseIsoDate(isoDateString: string): Date | undefined {
  if (typeof isoDateString === 'string' && isoDateString.length <= 10) {
    isoDateString = isoDateString + 'T00:00:00';
  }
  if (!isoDateString) {
    return isoDateString;
  }

  return parseISO(isoDateString);
}
