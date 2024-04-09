import { Select, SelectProps } from '@navikt/ds-react';

import { Controller, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from '../Bruttoinntekt/begrunnelseEndringBruttoinntektTekster';

interface EndringBruttoinntektAarsakProps extends Partial<SelectProps> {
  nyInnsending: boolean;
  name: string;
  sammeSomSist?: boolean;
}

export default function EndringBruttoinntektAarsak(props: Readonly<EndringBruttoinntektAarsakProps>) {
  const {
    formState: { errors }
  } = useFormContext();

  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (endring) => (endring !== 'Tariffendring' && props.nyInnsending === true) || props.nyInnsending === false
  );

  if (props.sammeSomSist) {
    begrunnelseKeys.push('SammeSomSist');
  }

  const error = findErrorInRHFErrors(props.name, errors);

  return (
    <Controller
      name={props.name}
      rules={{ required: 'Du må svare på dette spørsmålet' }}
      // defaultValue={''}
      render={({ field }) => (
        <Select
          label={props.label || 'Velg endringsårsak'}
          onChange={field.onChange}
          id={props.name}
          error={error}
          value={field.value}
        >
          <option value=''>Velg begrunnelse</option>
          {begrunnelseKeys.map((begrunnelseKey) => (
            <option value={begrunnelseKey} key={begrunnelseKey}>
              {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
            </option>
          ))}
        </Select>
      )}
    />
  );
}
