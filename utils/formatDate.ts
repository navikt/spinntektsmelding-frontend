import format from 'date-fns/format';

export default function formatDate(date?: Date): string {
  if (!date) {
    return '';
  }

  return format(date, 'dd.MM.yyyy');
}
