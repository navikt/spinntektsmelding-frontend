import { parseISO } from 'date-fns';

export default function parseIsoDate(isoDateString: string | Date | undefined): Date | undefined {
  if (typeof isoDateString === 'string' && isoDateString.length <= 10) {
    isoDateString = isoDateString + 'T00:00:00';
  }
  if (typeof isoDateString !== 'string') {
    return isoDateString;
  }

  return parseISO(isoDateString);
}
