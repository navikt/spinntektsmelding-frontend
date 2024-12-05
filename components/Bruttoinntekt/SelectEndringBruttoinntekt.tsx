import { Select, SelectProps } from '@navikt/ds-react';
import { ChangeEvent, useCallback } from 'react';

import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';

interface SelectEndringBruttoinntektProps extends Partial<SelectProps> {
  onChangeBegrunnelse: (verdi: string) => void;
  nyInnsending: boolean;
}

export default function SelectEndringBruttoinntekt(props: SelectEndringBruttoinntektProps) {
  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (endring) => (endring !== 'Tariffendring' && props.nyInnsending === true) || props.nyInnsending === false
  );

  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      props.onChangeBegrunnelse(event.target.value);
    },
    [props]
  );

  return (
    <Select
      label={props.label || 'Velg endringsårsak'}
      onChange={changeHandler}
      id={props.id}
      error={props.error}
      value={props.value}
    >
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
