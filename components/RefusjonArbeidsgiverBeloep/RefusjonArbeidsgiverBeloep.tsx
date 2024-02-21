import { Alert, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import localStyles from '../RefusjonArbeidsgiver/RefusjonArbeidsgiver.module.css';
import ButtonEndre from '../ButtonEndre';
import { useFormContext } from 'react-hook-form';
import stringishToNumber from '../../utils/stringishToNumber';

interface RefusjonArbeidsgiverBeloepProps {
  arbeidsgiverperiodeDisabled?: boolean;
}

export default function RefusjonArbeidsgiverBeloep({
  arbeidsgiverperiodeDisabled = false
}: Readonly<RefusjonArbeidsgiverBeloepProps>) {
  const [erEditerbar, setErEditerbar] = useState<boolean>(false);
  const {
    getValues,
    register,
    watch,
    formState: { errors }
  } = useFormContext();

  const refusjonTilArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Refusjon til arbeidsgiver i sykefraværet'
    : 'Refusjon til arbeidsgiver etter arbeidsgiverperiode';

  let bruttoinntekt = watch('refusjon.refusjonPrMnd');
  if (bruttoinntekt === undefined) {
    bruttoinntekt = getValues('refusjon.refusjonPrMnd');
  }
  if (!erEditerbar) {
    return (
      <>
        <TextLabel>{refusjonTilArbeidsgiverEtterAgpLegend}</TextLabel>
        <div className={localStyles.belopswrapper}>
          <div className={localStyles.belop} data-cy='refusjon-arbeidsgiver-belop'>
            {formatCurrency(bruttoinntekt)}&nbsp;kr
          </div>
          <ButtonEndre
            className={localStyles.endre_knapp}
            onClick={() => setErEditerbar(true)}
            data-cy='endre-refusjon-arbeidsgiver-belop'
          />
          <span>
            Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør NAV. NAV vil
            refundere opp til 6G av årslønn.
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={localStyles.belopswrapper}>
        <TextField
          className={localStyles.refusjonsbelop}
          label='Oppgi refusjonsbeløpet per måned'
          error={errors.refusjonBeloep?.message as string}
          data-cy='refusjon-arbeidsgiver-belop-input'
          {...register('refusjon.refusjonPrMnd', {
            setValueAs: (value) => stringishToNumber(value)
          })}
        />
        <span className={localStyles.alert_span}>
          Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør NAV. NAV vil
          refundere opp til 6G av årslønn.
        </span>
      </div>
      <Alert variant='info' className={localStyles.alert_box}>
        Hvis den ansatt er delvis sykmeldt, skal dere ikke redusere refusjonsbeløpet. NAV baserer seg på full utbetalt
        lønn og tar hensyn til sykmeldingsgraden i utbetalingen.
      </Alert>
    </>
  );
}
