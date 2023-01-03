import { Select } from '@navikt/ds-react';
import { ChangeEvent, ReactNode } from 'react';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

interface SelectEndringBruttoinntektProps {
  onChangeBegrunnelse: (verdi: string) => void;
  error: ReactNode;
  id: string;
}

export default function SelectEndringBruttoinntekt(props: SelectEndringBruttoinntektProps) {
  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt);

  function changeHandler(event: ChangeEvent<HTMLSelectElement>) {
    props.onChangeBegrunnelse(event.target.value);
  }

  return (
    <Select label={'Velg endringsårsak'} onChange={changeHandler} id={props.id} error={props.error}>
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntekt[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
