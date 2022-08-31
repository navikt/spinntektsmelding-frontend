import formatISO from 'date-fns/formatISO';
import { isValid } from 'date-fns';

export default function formatIsoDate(date?: Date): string {
  if (!date) {
    return '';
  }

  if (!isValid(date)) {
    return '';
  }

  return formatISO(date, { representation: 'date' });
}
