import { TextField } from '@navikt/ds-react';
import { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import localStyles from './RefusjonArbeidsgiver.module.css';
import ButtonEndre from '../ButtonEndre';

interface RefusjonArbeidsgiverBelopProps {
  bruttoinntekt: number;
  onOppdaterBelop: (beloep: string) => void;
  visFeilmeldingsTekst: (feilmelding: string) => string;
}

export default function RefusjonArbeidsgiverBelop({
  bruttoinntekt,
  onOppdaterBelop,
  visFeilmeldingsTekst
}: RefusjonArbeidsgiverBelopProps) {
  const [erEditerbar, setEditerbar] = useState<boolean>(false);

  if (!erEditerbar) {
    return (
      <>
        <TextLabel>Refusjon til arbeidsgiver etter arbeidsgiverperiode</TextLabel>
        <div className={localStyles.belopswrapper}>
          <div className={localStyles.belop}>{formatCurrency(bruttoinntekt)}&nbsp;kr</div>
          <ButtonEndre onClick={() => setEditerbar(true)} />
          <span>
            Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør NAV. NAV vil
            refundere opp til 6G av årslønn.
          </span>
        </div>
      </>
    );
  }

  return (
    <TextField
      className={localStyles.refusjonsbelop}
      label='Oppgi refusjonsbeløpet per måned'
      defaultValue={formatCurrency(bruttoinntekt)}
      onChange={(event) => onOppdaterBelop(event.target.value)}
      id={'lus-input'}
      error={visFeilmeldingsTekst('lus-input')}
    />
  );
}
