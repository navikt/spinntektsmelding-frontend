import { isValid, format } from 'date-fns';

export default function formatDate(date?: Date): string {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, 'dd.MM.yyyy');
}
