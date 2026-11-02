import { useFormContext, useWatch } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import type { Forespoersel } from '../schema/EndepunktSykepengesoeknaderSchema';
import type { SykepengePeriode } from './useInitieringData';

export type PeriodevalgSkjema = {
  forespurtSykepengePeriodeId?: string;
  sykepengePeriodeId?: string[];
  endreRefusjon?: 'Ja' | 'Nei' | '';
};

export default function useInitieringPeriodevalg(perioder: SykepengePeriode[], forespoersler: Forespoersel[]) {
  const { control, resetField, setValue } = useFormContext<PeriodevalgSkjema>();
  const [forespurtSykepengePeriodeId, valgtePeriodeIder, endreRefusjon] = useWatch({
    control,
    name: ['forespurtSykepengePeriodeId', 'sykepengePeriodeId', 'endreRefusjon']
  });

  const valgtePerioder =
    forespurtSykepengePeriodeId === 'andrePerioder'
      ? perioder.filter((periode) => valgtePeriodeIder?.includes(periode.id))
      : [];

  const harForlengelseMedForespoersel = (valgtePerioder: SykepengePeriode[]) =>
    valgtePerioder.some((periode) =>
      forespoersler.some((forespoersel) => forespoersel.vedtaksperiodeId === periode.forlengerVedtaksperiodeId)
    );

  const onRadioChange = (
    value: string,
    field: ControllerRenderProps<PeriodevalgSkjema, 'forespurtSykepengePeriodeId'>
  ) => {
    resetField('sykepengePeriodeId', { defaultValue: undefined });
    resetField('endreRefusjon', { defaultValue: undefined });
    field.onChange(value);
  };

  const onCheckboxChange = (value: string[], field: ControllerRenderProps<PeriodevalgSkjema, 'sykepengePeriodeId'>) => {
    const nyeValgtePerioder = perioder.filter((periode) => value.includes(periode.id));
    if (!harForlengelseMedForespoersel(nyeValgtePerioder)) {
      setValue('endreRefusjon', undefined, { shouldValidate: true, shouldDirty: true });
    }
    field.onChange(value);
  };

  return {
    valgtePerioder,
    harValgtPeriodeMedForlengelse: harForlengelseMedForespoersel(valgtePerioder),
    endreRefusjon,
    disablePeriodeCheck: forespurtSykepengePeriodeId !== 'andrePerioder',
    onRadioChange,
    onCheckboxChange
  };
}
