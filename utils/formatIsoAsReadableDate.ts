import formatDate from './formatDate';
import parseIsoDate from './parseIsoDate';

const formatIsoAsReadableDate = (isoDate: string | Date) => {
  if (isoDate instanceof Date) {
    return formatDate(isoDate);
  }

  return formatDate(parseIsoDate(isoDate));
};

export default formatIsoAsReadableDate;
