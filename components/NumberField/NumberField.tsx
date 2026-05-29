import { TextField } from '@navikt/ds-react';
import { useCallback, useEffect } from 'react';
import lokalStyling from './NumberField.module.css';

const sanitizeToSingleComma = (value: string): string => {
  const parts = value.split(',');
  return parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '');
};

const toDisplayValue = (val: string | number | readonly string[] | undefined | null): string => {
  if (val == null) return '';
  if (typeof val === 'number') return Number.isNaN(val) ? '' : String(val).replaceAll('.', ',');
  return sanitizeToSingleComma(String(val).replaceAll('.', ','));
};

export default function NumberField({ ...props }: React.ComponentProps<typeof TextField>) {
  const isControlled = props.value != null;

  const formatInputDisplayIfNeeded = useCallback(() => {
    if (isControlled) return;

    let input: HTMLInputElement | null = null;
    if (typeof props.id === 'string') {
      input = document.getElementById(props.id) as HTMLInputElement | null;
    } else if (typeof props.name === 'string') {
      input = document.querySelector<HTMLInputElement>(`input[name="${props.name}"]`);
    }

    if (!input) return;

    const formatted = toDisplayValue(input.value);
    if (formatted !== input.value) {
      input.value = formatted;
    }
  }, [isControlled, props.id, props.name]);

  useEffect(() => {
    formatInputDisplayIfNeeded();
  }, [formatInputDisplayIfNeeded, props.defaultValue]);

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
  const formattedDefaultValue = isControlled ? undefined : toDisplayValue(props.defaultValue);

  return (
    <TextField
      inputMode='decimal'
      {...props}
      value={formattedValue}
      defaultValue={formattedDefaultValue}
      onChange={onChange}
      className={[props.className, lokalStyling.numberField].filter(Boolean).join(' ')}
    />
  );
}
