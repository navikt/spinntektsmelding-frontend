export default function formatCurrency(currency: number | undefined | null): string {
  if (currency === null) {
    return '';
  }

  return currency !== undefined
    ? new Intl.NumberFormat('no-NO', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(currency)
    : '';
}
