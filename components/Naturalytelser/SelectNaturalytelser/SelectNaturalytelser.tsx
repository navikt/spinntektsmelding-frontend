import { Select } from '@navikt/ds-react';
import naturalytelser from './naturalytelser';

interface SelectNaturalytelserProps {
  onChangeYtelse?: (event: React.ChangeEvent<HTMLSelectElement>, ytelseId: string) => void;
  elementId?: string;
  defaultValue?: string;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SelectNaturalytelser(props: SelectNaturalytelserProps) {
  const ytelsesKeys = Object.keys(naturalytelser);
  const defaultYtelse = props.defaultValue ? props.defaultValue.toUpperCase() : '';
  return (
    <Select label={''} onChange={props.onChange} defaultValue={defaultYtelse} error={props.error}>
      <option value=''>Velg naturalytelse</option>
      {ytelsesKeys.map((ytelseKey) => (
        <option value={ytelseKey} key={ytelseKey}>
          {naturalytelser[ytelseKey]}
        </option>
      ))}
    </Select>
  );
}
