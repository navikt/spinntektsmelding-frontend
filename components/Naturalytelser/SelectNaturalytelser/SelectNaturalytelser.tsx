import { Select } from '@navikt/ds-react';
import naturalytelser from './naturalytelser';

interface SelectNaturalytelserProps {
  onChangeYtelse: (event: React.ChangeEvent<HTMLSelectElement>, ytelseId: string) => void;
  elementId: string;
  defaultValue?: string;
  error?: string;
}

export default function SelectNaturalytelser(props: SelectNaturalytelserProps) {
  const ytelsesKeys = Object.keys(naturalytelser);
  return (
    <Select
      label={''}
      onChange={(event) => props.onChangeYtelse(event, props.elementId)}
      defaultValue={props.defaultValue}
      error={props.error}
    >
      <option value=''>Velg naturalytelse</option>
      {ytelsesKeys.map((ytelseKey) => (
        <option value={ytelseKey} key={ytelseKey}>
          {naturalytelser[ytelseKey]}
        </option>
      ))}
    </Select>
  );
}
