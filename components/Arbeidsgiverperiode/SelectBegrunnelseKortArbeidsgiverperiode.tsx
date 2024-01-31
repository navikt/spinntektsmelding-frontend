import { Select } from '@navikt/ds-react';

import localStyles from './SelectBegrunnelseKortArbeidsgiverperiode.module.css';
import begrunnelseIngenEllerRedusertUtbetalingListe from '../RefusjonArbeidsgiver/begrunnelseIngenEllerRedusertUtbetalingListe';
import filterBegrunnelseKortArbeidsgiverperiode from './filterBegrunnelseKortArbeidsgiverperiode';

interface SelectBegrunnelseKortArbeidsgiverperiodeProps {
  onChangeBegrunnelse: (verdi: string) => void;
  defaultValue?: string;
  error?: React.ReactNode;
  label?: string;
}

export default function SelectBegrunnelseKortArbeidsgiverperiode(props: SelectBegrunnelseKortArbeidsgiverperiodeProps) {
  const begrunnelseKeys = Object.keys(begrunnelseIngenEllerRedusertUtbetalingListe).filter(
    (begrunnelse) => filterBegrunnelseKortArbeidsgiverperiode.indexOf(begrunnelse) > -1
  );
  const label = props.label ? props.label : 'Velg begrunnelse for kort arbeidsgiverperiode';

  return (
    <Select
      label={label}
      onChange={(event) => props.onChangeBegrunnelse(event.target.value)}
      id={'lia-select'}
      className={localStyles.selectbegrunnelse}
      defaultValue={props.defaultValue}
      error={props.error}
    >
      <option value=''>Velg begrunnelse</option>
      {begrunnelseKeys.map((begrunnelseKey) => (
        <option value={begrunnelseKey} key={begrunnelseKey}>
          {begrunnelseIngenEllerRedusertUtbetalingListe[begrunnelseKey]}
        </option>
      ))}
    </Select>
  );
}
