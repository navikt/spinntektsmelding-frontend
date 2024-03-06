import { Alert, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import localStyles from '../RefusjonArbeidsgiver/RefusjonArbeidsgiver.module.css';
import ButtonEndre from '../ButtonEndre';
import { useFormContext } from 'react-hook-form';
import stringishToNumber from '../../utils/stringishToNumber';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

interface RefusjonArbeidsgiverBeloepProps {
  arbeidsgiverperiodeDisabled?: boolean;
}

export default function RefusjonArbeidsgiverBeloep({
  arbeidsgiverperiodeDisabled = false
}: Readonly<RefusjonArbeidsgiverBeloepProps>) {
  const [erEditerbar, setErEditerbar] = useState<boolean>(false);
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext();

  const refusjonTilArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Refusjon til arbeidsgiver i sykefraværet'
    : 'Refusjon til arbeidsgiver etter arbeidsgiverperiode';

  const beloepFeltnavn = 'refusjon.refusjonPrMnd';
  const beloepError = findErrorInRHFErrors(beloepFeltnavn, errors);

  let refusjonPrMnd = watch(beloepFeltnavn);
  // if (refusjonPrMnd === undefined) {
  //   refusjonPrMnd = getValues('refusjon.refusjonPrMnd');
  // }

  const endreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErEditerbar(true);
  };

  if (!erEditerbar) {
    return (
      <>
        <TextLabel>{refusjonTilArbeidsgiverEtterAgpLegend}</TextLabel>
        <div className={localStyles.beloepswrapper}>
          <div className={localStyles.beloep} data-cy='refusjon-arbeidsgiver-beloep'>
            {formatCurrency(refusjonPrMnd)}&nbsp;kr
          </div>
          <ButtonEndre
            className={localStyles.endre_knapp}
            onClick={endreClick}
            data-cy='endre-refusjon-arbeidsgiver-beloep'
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
      <div className={localStyles.beloepswrapper}>
        <TextField
          className={localStyles.refusjonsbeloep}
          label='Oppgi refusjonsbeløpet per måned'
          error={beloepError}
          data-cy='refusjon-arbeidsgiver-beloep-input'
          {...register(beloepFeltnavn, {
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
