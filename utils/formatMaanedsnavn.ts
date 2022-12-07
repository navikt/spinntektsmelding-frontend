const maanedsnavn = [
  '',
  'Januar',
  'Februar',
  'Mars',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const formatMaanedsnavn = (maaned: string): string => {
  const maanedParts = maaned.split('-');

  const maaneden = maanedsnavn[Number(maanedParts[1])];

  if (maaneden === undefined) return '';

  return maanedsnavn[Number(maanedParts[1])];
};

export default formatMaanedsnavn;
