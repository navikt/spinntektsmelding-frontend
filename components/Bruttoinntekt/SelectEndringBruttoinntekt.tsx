import { Select, SelectProps } from '@navikt/ds-react';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import begrunnelseEndringBruttoinntektTekster from './begrunnelseEndringBruttoinntektTekster';
import { useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import z from 'zod/v4';
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

  const begrunnelser: string[] =
    valgteBegrunnelser && valgteBegrunnelser.length > 0
      ? valgteBegrunnelser?.map((valgtBegrunnelse) => valgtBegrunnelse.aarsak)
      : [];

  let begrunnelseKeys = Object.keys(begrunnelseEndringBruttoinntekt).filter(
    (endring) =>
      (endring !== 'Tariffendring' && nyInnsending === true && !begrunnelser.includes(endring)) ||
      (nyInnsending === false && !begrunnelser.includes(endring))
  );

  console.log('denneBegrunnelsen', denneBegrunnelsen);
  console.log('begrunnelseKeys før', begrunnelseKeys);
  // Legg til valgt begrunnelse hvis den ikke er i listen
  if (denneBegrunnelsen && denneBegrunnelsen !== '') {
    begrunnelseKeys.push(denneBegrunnelsen);
  }

  begrunnelseKeys = [...new Set(begrunnelseKeys)];

  console.log('begrunnelseKeys etter', begrunnelseKeys);
  console.log('valgteBegrunnelser', valgteBegrunnelser);
  console.log('begrunnelserId', begrunnelserId, id);

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
