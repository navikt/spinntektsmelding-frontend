export default function findErrorInRHFErrors(name: string, errors: Record<string, unknown>): string | undefined {
  const errorName = name.replaceAll('[', '.').replaceAll(']', '');

  const errorKey = errorName.split('.');
  const error = errorKey.reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) {
      return undefined;
    }

    const value = (acc as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string') {
      return value.error;
    }
    return value;
  }, errors);

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined;
  }
  return typeof error === 'string' ? error : undefined;
}
