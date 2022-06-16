export default function formatCurrency(currency: number): string {
  return new Intl.NumberFormat('no-NO', { maximumFractionDigits: 2 }).format(currency);
}
