export default function formatCurrency(currency: number | undefined): string {
  console.log('currency', currency);
  return currency !== undefined
    ? new Intl.NumberFormat('no-NO', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(currency)
    : '';
}
