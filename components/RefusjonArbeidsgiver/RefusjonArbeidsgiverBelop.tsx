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
  arbeidsgiverperiodeDisabled?: boolean;
}

export default function RefusjonArbeidsgiverBelop({
  bruttoinntekt,
  onOppdaterBelop,
  visFeilmeldingsTekst,
  arbeidsgiverperiodeDisabled = false
}: RefusjonArbeidsgiverBelopProps) {
  const [erEditerbar, setEditerbar] = useState<boolean>(false);

  const refusjonTilArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Refusjon til arbeidsgiver i sykefraværet'
    : 'Refusjon til arbeidsgiver etter arbeidsgiverperiode';

  if (!erEditerbar) {
    return (
      <>
        <TextLabel>{refusjonTilArbeidsgiverEtterAgpLegend}</TextLabel>
        <div className={localStyles.belopswrapper}>
          <div className={localStyles.belop} data-cy='refusjon-arbeidsgiver-belop'>
            {formatCurrency(bruttoinntekt)}&nbsp;kr
          </div>
          <ButtonEndre onClick={() => setEditerbar(true)} data-cy='endre-refusjon-arbeidsgiver-belop' />
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
      value={bruttoinntekt}
      onChange={(event) => onOppdaterBelop(event.target.value)}
      id={'lus-input'}
      error={visFeilmeldingsTekst('lus-input')}
      data-cy='refusjon-arbeidsgiver-belop-input'
    />
  );
}
