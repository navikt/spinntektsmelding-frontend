import { Select } from '@navikt/ds-react';
import begrunnelseIngenEllerRedusertUtbetalingListe from './begrunnelseIngenEllerRedusertUtbetalingListe';
import localStyles from './SelectBegrunnelse.module.css';

interface SelectBegrunnelseProps {
  onChangeBegrunnelse: (verdi: string) => void;
  defaultValue?: string;
  error?: React.ReactNode;
  label?: string;
}

export default function SelectBegrunnelse(props: SelectBegrunnelseProps) {
  const begrunnelseKeys = Object.keys(begrunnelseIngenEllerRedusertUtbetalingListe);
  const label = props.label ? props.label : 'Velg begrunnelse for forkortet arbeidsgiverperiode';
  return (
    <Select
      label={label}
      onChange={(event) => props.onChangeBegrunnelse(event.target.value)}
      id={'agp-select'}
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
