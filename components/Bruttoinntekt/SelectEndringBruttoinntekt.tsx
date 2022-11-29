import { Select } from '@navikt/ds-react';
import { ReactNode } from 'react';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

interface SelectEndringBruttoinntektProps {
  onChangeBegrunnelse: (verdi: string) => void;
  error: ReactNode;
  id: string;
}

export default function SelectEndringBruttoinntekt(props: SelectEndringBruttoinntektProps) {
  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt);
  return (
    <Select
      label={'Velg endringsårsak'}
      onChange={(event) => props.onChangeBegrunnelse(event.target.value)}
      id={props.id}
      error={props.error}
    >
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntekt[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
