import { TextField } from '@navikt/ds-react';

const sanitizeToSingleComma = (value: string): string => {
  const parts = value.split(',');
  return parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '');
};

const toDisplayValue = (val: string | number | readonly string[] | undefined): string => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') return isNaN(val) ? '' : String(val).replaceAll('.', ',');
  return sanitizeToSingleComma(String(val).replaceAll('.', ','));
};

export default function NumberField({ ...props }: React.ComponentProps<typeof TextField>) {
  const isControlled = props.value !== undefined;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedComma = sanitizeToSingleComma(e.target.value.replaceAll(/[^0-9,]/g, ''));
    e.target.value = sanitizedComma.replaceAll(',', '.');

    if (props.onChange) {
      props.onChange(e);
    }

    if (!isControlled) {
      e.target.value = sanitizedComma;
    }
  };

  const formattedValue = isControlled ? toDisplayValue(props.value) : undefined;

  return <TextField inputMode='decimal' {...props} value={formattedValue} onChange={onChange} />;
}
