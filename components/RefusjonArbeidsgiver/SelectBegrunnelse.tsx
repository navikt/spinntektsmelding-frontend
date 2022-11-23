import { Select } from '@navikt/ds-react';
import begrunnelseIngenEllerRedusertUtbetalingListe from './begrunnelseIngenEllerRedusertUtbetalingListe';
import localStyles from './RefusjonArbeidsgiver.module.css';

interface SelectBegrunnelseProps {
  onChangeBegrunnelse: (verdi: string) => void;
}

export default function SelectBegrunnelse(props: SelectBegrunnelseProps) {
  const begrunnelseKeys = Object.keys(begrunnelseIngenEllerRedusertUtbetalingListe);
  return (
    <Select
      label={'Velg begrunnelse for ingen eller redusert utbetaling'}
      onChange={(event) => props.onChangeBegrunnelse(event.target.value)}
      id={'lia-select'}
      className={localStyles.selectbegrunnelse}
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
