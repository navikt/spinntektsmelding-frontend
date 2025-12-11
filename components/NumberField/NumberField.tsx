import { TextField } from '@navikt/ds-react';

export default function NumberField({ ...props }: React.ComponentProps<typeof TextField>) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    let sanitizedValue = value.replaceAll(/[^0-9,]/g, '');
    const parts = sanitizedValue.split(',');
    sanitizedValue = parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('').replaceAll(',', '') : '');

    e.target.value = sanitizedValue;

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const formatValue = (val: string | number): string => {
    const str = String(val).replaceAll('.', ',');
    const parts = str.split(',');
    return parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '');
  };

  const formattedValue =
    typeof props.value === 'string' || typeof props.value === 'number' ? formatValue(props.value) : props.value;

  return <TextField inputMode='decimal' {...props} value={formattedValue} onChange={onChange} />;
}
