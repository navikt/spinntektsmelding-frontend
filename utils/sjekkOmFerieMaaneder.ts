import { HistoriskInntekt } from '../schema/historiskInntektSchema';

function sjekkOmFerieMaaneder(tidligereinntekt: HistoriskInntekt | undefined): boolean {
  if (!tidligereinntekt) {
    return false;
  }
  const arrTidligereinntekt = Array.from(tidligereinntekt);
  const ferieMnd = arrTidligereinntekt
    ?.map((inntekt) => inntekt[0].split('-')[1])
    .filter((mnd) => Number(mnd) >= 5 && Number(mnd) <= 8);

  return ferieMnd !== undefined && ferieMnd.length > 0;
}

export default sjekkOmFerieMaaneder;
