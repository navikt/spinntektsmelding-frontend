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

  return maanedsnavn[Number(maanedParts[1])];
};

export default formatMaanedsnavn;
