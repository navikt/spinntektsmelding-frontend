import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import styling from './Behandlingsdager.module.css';
import { Periode } from '../../state/state';
import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { use, useEffect, useEffectEvent, useRef } from 'react';
import useBoundStore from '../../state/useBoundStore';
import Feilmelding from '../Feilmelding';

interface BehandlingsdagerProps {
  behandlingsdager?: string[];
  arbeidsgiverperioder?: Periode[];
}

export function Behandlingsdager({ behandlingsdager, arbeidsgiverperioder }: Readonly<BehandlingsdagerProps>) {
  const {
    control,
    formState: { errors },
    setError
  } = useFormContext();

  const agpDatoer = arbeidsgiverperioder?.flatMap((periode) => periode.fom);
  const sorterteDager = [...(behandlingsdager ?? [])].sort((a, b) => a.localeCompare(b));
  const defaultPerioder = sorterteDager
    .filter((dag) => agpDatoer?.some((dato) => dato?.getTime() === parseIsoDate(dag)?.getTime()))
    .map((dag) => ({ fom: dag, tom: dag }));

  const { field } = useController({ name: 'agp.perioder', control, defaultValue: defaultPerioder });

  const agpFraSkjema = useWatch({ name: 'agp.perioder' });
  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);
  const harGjortManuelleEndringer = useRef(false);

  const setAgp = useEffectEvent((perioder: { fom: string; tom: string }[]) => {
    setArbeidsgiverperioder(
      perioder.map((p) => ({
        fom: parseIsoDate(p.fom),
        tom: parseIsoDate(p.tom),
        id: `${p.fom}-${p.tom}`
      }))
    );
  });

  useEffect(() => {
    if (!harGjortManuelleEndringer.current) return;
    if (agpFraSkjema && agpFraSkjema.length > 0) {
      setAgp(agpFraSkjema);
    }
  }, [agpFraSkjema]);

  useEffect(() => {
    if (agpFraSkjema && agpFraSkjema.length !== 12) {
      const feil = 'Du må velge 12 behandlingsdager i arbeidsgiverperioden.';
      setError('agp.perioder', { type: 'manual', message: feil });
    }
  }, [agpFraSkjema, setError]);

  if (!behandlingsdager || behandlingsdager.length === 0) {
    return null;
  }

  const selectedDates: string[] = (field.value ?? []).map((p: { fom: string }) => p.fom);

  const handleChange = (valgteDatoer: string[]) => {
    harGjortManuelleEndringer.current = true;
    field.onChange(valgteDatoer.map((dag) => ({ fom: dag, tom: dag })));
  };

  return (
    <div className={styling.behandlingsdager}>
      <CheckboxGroup legend='Behandlingsdager med arbeidsgiverperiode' value={selectedDates} onChange={handleChange}>
        <div className={styling.behandlingsdagerListe}>
          {sorterteDager.map((dag) => (
            <Checkbox key={dag} value={dag}>
              {formatDate(parseIsoDate(dag))}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
      {errors.agp?.perioder && <Feilmelding id='behandlingsdager-feil'>{errors.agp?.perioder?.message}</Feilmelding>}
    </div>
  );
}
