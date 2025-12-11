import { TextField } from '@navikt/ds-react';

export default function NumberField({ ...props }: React.ComponentProps<typeof TextField>) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Tillat kun tall og komma
    const sanitizedValue = value.replace(/[^0-9,]/g, '');
    e.target.value = sanitizedValue;
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Konverter value til norsk tallformat (punktum blir komma)
  const formattedValue =
    props.value !== undefined && props.value !== null ? String(props.value).replace('.', ',') : props.value;

  return <TextField inputMode='decimal' {...props} value={formattedValue} onChange={onChange} />;
}
