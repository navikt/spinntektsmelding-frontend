import { Select, SelectProps } from '@navikt/ds-react';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';
import { deriveBegrunnelseKeys } from './deriveBegrunnelseKeys';
import { useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import z from 'zod';
import { EndringAarsakSchema } from '../../schema/EndringAarsakSchema';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface SelectEndringBruttoinntektProps extends Partial<SelectProps> {
  nyInnsending: boolean;
  id: string;
  label?: string;
  begrunnelserId: string;
}

type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export default function SelectEndringBruttoinntekt({
  nyInnsending,
  label,
  id,
  begrunnelserId
}: Readonly<SelectEndringBruttoinntektProps>) {
  const {
    formState: { errors },
    register,
    watch
  } = useFormContext();
  const valgteBegrunnelser: EndringAarsak[] = watch(begrunnelserId);
  const denneBegrunnelsen = watch(id);

  const begrunnelseKeys = deriveBegrunnelseKeys({
    valgteBegrunnelser,
    currentBegrunnelse: denneBegrunnelsen,
    nyInnsending
  });

  const error = findErrorInRHFErrors(id, errors);
  return (
    <Select label={label ?? 'Velg endringsårsak'} error={error} id={ensureValidHtmlId(id)} {...register(id)}>
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
