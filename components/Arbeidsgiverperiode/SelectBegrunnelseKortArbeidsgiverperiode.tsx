import { Select } from '@navikt/ds-react';

import lokalStyling from './SelectBegrunnelseKortArbeidsgiverperiode.module.css';
import begrunnelseIngenEllerRedusertUtbetalingListe from '../RefusjonArbeidsgiver/begrunnelseIngenEllerRedusertUtbetalingListe';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface SelectBegrunnelseKortArbeidsgiverperiodeProps {
  onChangeBegrunnelse: (verdi: string) => void;
  value?: string;
  error?: React.ReactNode;
  label?: string;
  ikkeAgp?: boolean;
}

export default function SelectBegrunnelseKortArbeidsgiverperiode(
  props: Readonly<SelectBegrunnelseKortArbeidsgiverperiodeProps>
) {
  const begrunnelse = Object.keys(begrunnelseIngenEllerRedusertUtbetalingListe);
  const label = props.label ?? 'Velg begrunnelse for kort arbeidsgiverperiode';

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChangeBegrunnelse(event.target.value);
  };

  return (
    <Select
      label={label}
      onChange={onChange}
      id={ensureValidHtmlId('agp.redusertLoennIAgp.begrunnelse')}
      className={lokalStyling.selectbegrunnelse}
      value={props.value ?? ''}
      error={props.error}
    >
      <option value=''>Velg begrunnelse</option>
      {begrunnelse.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseIngenEllerRedusertUtbetalingListe[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
