import { Select, SelectProps } from '@navikt/ds-react';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';
import { useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import z from 'zod';
import { EndringAarsakSchema } from '../../schema/EndringAarsakSchema';

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

  const begrunnelser: string[] =
    valgteBegrunnelser && valgteBegrunnelser.length > 0
      ? valgteBegrunnelser?.map((valgtBegrunnelse) => valgtBegrunnelse.aarsak)
      : [];

  const begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (endring) =>
      (endring !== 'Tariffendring' && nyInnsending === true && !begrunnelser.includes(endring)) ||
      (nyInnsending === false && !begrunnelser.includes(endring))
  );
  if (denneBegrunnelsen && denneBegrunnelsen !== '') {
    begrunnelseKeys.push(denneBegrunnelsen);
  }

  const error = findErrorInRHFErrors(id, errors);
  return (
    <Select label={label ?? 'Velg endringsårsak'} error={error} id={id} {...register(id)}>
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseEndringBruttoinntektTekster[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
