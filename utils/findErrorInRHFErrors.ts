import { FieldErrors, FieldValues, FieldError } from 'react-hook-form';

// Traverses react-hook-form nested FieldErrors with path like "inntekt.endringAarsaker[0].aarsak"
// Backwards compatible with legacy test fixtures that stored either:
//  - { field: 'Error text' }
//  - { field: { error: 'Error text' } }
//  - { field: { message: 'Error text' } } (current RHF shape)
// Supports both bracket and dot notation in the incoming path.
export default function findErrorInRHFErrors(path: string, errors: FieldErrors<FieldValues>): string | undefined {
  if (!path) return undefined;
  // Convert bracket indices and property access to dot form, then collapse consecutive dots.
  const normalized = path
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .replace(/\.\./g, '.');
  const segments = normalized.split('.').filter(Boolean);

  let current: any = errors;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }

  if (current == null) return undefined;

  // RHF FieldError shape
  if ((current as FieldError)?.message) return (current as FieldError).message as string;
  // Legacy { error: string }
  if (typeof current === 'object' && current && 'error' in current && typeof current.error === 'string') {
    return current.error as string;
  }
  // Direct string leaf
  if (typeof current === 'string') return current;
  return undefined;
}
