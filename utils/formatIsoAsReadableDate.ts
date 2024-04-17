import formatDate from './formatDate';
import parseIsoDate from './parseIsoDate';

const formatIsoAsReadableDate = (isoDate: string) => formatDate(parseIsoDate(isoDate));

export default formatIsoAsReadableDate;
