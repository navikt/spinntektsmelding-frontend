import { Select } from '@navikt/ds-react';
import { ChangeEvent, ReactNode, useCallback } from 'react';

import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';

interface SelectEndringBruttoinntektProps {
  onChangeBegrunnelse: (verdi: string) => void;
  error: ReactNode;
  id: string;
}

export default function SelectEndringBruttoinntekt(props: SelectEndringBruttoinntektProps) {
  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt);
  // const [begrunnelse, setBegrunnelse] = useState<string>('');

  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      props.onChangeBegrunnelse(event.target.value);
      // setBegrunnelse(event.target.value);
    },
    [props]
  );

  return (
    <>
      <Select label={'Velg endringsårsak'} onChange={changeHandler} id={props.id} error={props.error}>
        <option value=''>Velg begrunnelse</option>
        {begrunnelseKeys.map((begrunnelseKey) => (
          <option value={begrunnelseKey} key={begrunnelseKey}>
            {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
          </option>
        ))}
      </Select>
    </>
  );
}
