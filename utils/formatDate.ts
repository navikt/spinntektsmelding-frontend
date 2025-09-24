import { isValid } from 'date-fns/isValid';
import { format } from 'date-fns/format';

export default function formatDate(date?: Date): string {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, 'dd.MM.yyyy');
}
