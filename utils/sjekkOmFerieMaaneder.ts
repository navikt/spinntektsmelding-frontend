import { HistoriskInntekt } from '../state/state';

function sjekkOmFerieMaaneder(tidligereinntekt: Array<HistoriskInntekt> | undefined): boolean {
  const ferieMnd = tidligereinntekt
    ?.map((inntekt) => inntekt.maaned.split('-')[1])
    .filter((mnd) => Number(mnd) >= 5 && Number(mnd) <= 8);

  return ferieMnd !== undefined && ferieMnd.length > 0;
}

export default sjekkOmFerieMaaneder;
