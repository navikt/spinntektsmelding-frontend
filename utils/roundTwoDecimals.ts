export default function roundTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
