import { Alert, BodyLong, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import localStyles from './RefusjonArbeidsgiver.module.css';
import ButtonEndre from '../ButtonEndre';

interface RefusjonArbeidsgiverBelopProps {
  bruttoinntekt: number;
  onOppdaterBelop: (beloep: string) => void;
  visFeilmeldingTekst: (feilmelding: string) => string;
  arbeidsgiverperiodeDisabled?: boolean;
  onEditerbarChange: (editerbar: boolean) => void;
}

export default function RefusjonArbeidsgiverBelop({
  bruttoinntekt,
  onOppdaterBelop,
  visFeilmeldingTekst,
  arbeidsgiverperiodeDisabled = false,
  onEditerbarChange
}: Readonly<RefusjonArbeidsgiverBelopProps>) {
  const [editerbar, setEditerbar] = useState<boolean>(false);

  const refusjonTilArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Refusjon til arbeidsgiver i sykefraværet'
    : 'Refusjon til arbeidsgiver etter arbeidsgiverperiode';

  const handleButtonEndreBeloepClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    onEditerbarChange(true);
    setEditerbar(true);
  };

  if (!editerbar) {
    return (
      <>
        <TextLabel>{refusjonTilArbeidsgiverEtterAgpLegend}</TextLabel>
        <BodyLong>
          Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil
          refundere opp til 6G av årslønn.
        </BodyLong>
        <div className={localStyles.beloepswrapper}>
          <div className={localStyles.beloep} data-cy='refusjon-arbeidsgiver-beloep'>
            {formatCurrency(bruttoinntekt)}&nbsp;kr/måned
          </div>
          <ButtonEndre
            className={localStyles.endre_knapp}
            onClick={handleButtonEndreBeloepClick}
            data-cy='endre-refusjon-arbeidsgiver-beloep'
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={localStyles.beloepswrapper}>
        <TextField
          className={localStyles.refusjonBeloep}
          label='Oppgi refusjonsbeløpet per måned'
          value={bruttoinntekt}
          onChange={(event) => onOppdaterBelop(event.target.value)}
          id={'refusjon.beloepPerMaaned'}
          error={visFeilmeldingTekst('refusjon.beloepPerMaaned')}
          data-cy='refusjon-arbeidsgiver-beloep-input'
        />
        <span className={localStyles.alert_span}>
          Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil
          refundere opp til 6G av årslønn.
        </span>
      </div>
      <Alert variant='info' className={localStyles.alert_box}>
        Hvis den ansatt er delvis sykmeldt, skal du ikke redusere refusjonsbeløpet. Nav baserer seg på full utbetalt
        lønn og tar hensyn til sykmeldingsgraden i utbetalingen.
      </Alert>
    </>
  );
}
