import { Select } from '@navikt/ds-react';

import localStyles from './SelectBegrunnelseKortArbeidsgiverperiode.module.css';
import begrunnelseIngenEllerRedusertUtbetalingListe from '../RefusjonArbeidsgiver/begrunnelseIngenEllerRedusertUtbetalingListe';
import filterBegrunnelseKortArbeidsgiverperiode from './filterBegrunnelseKortArbeidsgiverperiode';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface SelectBegrunnelseKortArbeidsgiverperiodeProps {
  onChangeBegrunnelse: (verdi: string) => void;
  defaultValue?: string;
  error?: React.ReactNode;
  label?: string;
  ikkeAgp?: boolean;
}

export default function SelectBegrunnelseKortArbeidsgiverperiode(
  props: Readonly<SelectBegrunnelseKortArbeidsgiverperiodeProps>
) {
  const begrunnelseKeys = Object.keys(begrunnelseIngenEllerRedusertUtbetalingListe).filter(
    (begrunnelse) => filterBegrunnelseKortArbeidsgiverperiode.indexOf(begrunnelse) > -1
  );
  const label = props.label ?? 'Velg begrunnelse for kort arbeidsgiverperiode';

  let begrunnelse: string[] = [];

  if (props.ikkeAgp) {
    begrunnelse = begrunnelseKeys.filter((begrunnelse) => {
      return begrunnelse !== 'BetvilerArbeidsufoerhet';
    });
  } else {
    begrunnelse = [...begrunnelseKeys];
  }

  return (
    <Select
      label={label}
      onChange={(event) => props.onChangeBegrunnelse(event.target.value)}
      id={ensureValidHtmlId('agp.redusertLoennIAgp.begrunnelse')}
      className={localStyles.selectbegrunnelse}
      defaultValue={props.defaultValue}
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
