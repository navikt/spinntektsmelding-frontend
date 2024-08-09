import leftPad from './leftPad';

export const toLocalIso = (val: Date) => {
  return `${val.getFullYear()}-${leftPad(val.getMonth() + 1)}-${leftPad(val.getDate())}`;
};
