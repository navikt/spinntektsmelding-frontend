import { format } from 'date-fns';

export default function formatTime(dateTime: Date) {
  return format(dateTime, 'HH:mm');
}
