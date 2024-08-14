export default function leftPad(val: number): string {
  return val < 10 ? `0${val}` : `${val}`;
}
