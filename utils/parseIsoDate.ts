import { parseISO } from 'date-fns';

export default function parseIsoDate(isoDateString: string): Date {
  return parseISO(isoDateString);
}
