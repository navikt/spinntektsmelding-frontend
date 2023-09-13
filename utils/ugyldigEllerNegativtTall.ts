export default function ugyldigEllerNegativtTall(tall?: number | null) {
  return tall === undefined || tall === null || tall < 0 || Number.isNaN(tall);
}
