import { Select, SelectProps } from '@navikt/ds-react';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';
import { useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

interface SelectEndringBruttoinntektProps extends Partial<SelectProps> {
  nyInnsending: boolean;
  id: string;
  register: any;
  error?: string;
}

export default function SelectEndringBruttoinntekt({
  nyInnsending,
  label,
  id
}: Readonly<SelectEndringBruttoinntektProps>) {
  const {
    formState: { errors },
    register
  } = useFormContext();
  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (endring) => (endring !== 'Tariffendring' && nyInnsending === true) || nyInnsending === false
  );

  const error = findErrorInRHFErrors(id, errors);
  return (
    <Select label={label || 'Velg endringsårsak'} error={error} {...register(id)}>
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
