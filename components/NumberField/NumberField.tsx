import { TextField } from '@navikt/ds-react';

const sanitizeToSingleComma = (value: string): string => {
  const parts = value.split(',');
  return parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '');
};

const formatToNorwegianNumber = (val: string | number): string => {
  const str = String(val).replaceAll('.', ',');
  return sanitizeToSingleComma(str);
};

export default function NumberField({ ...props }: React.ComponentProps<typeof TextField>) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const sanitizedValue = sanitizeToSingleComma(value.replaceAll(/[^0-9,]/g, ''));

    e.target.value = sanitizedValue;

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const formattedValue =
    typeof props.value === 'string' || typeof props.value === 'number'
      ? formatToNorwegianNumber(props.value)
      : props.value;

  return <TextField inputMode='decimal' {...props} value={formattedValue} onChange={onChange} />;
}
