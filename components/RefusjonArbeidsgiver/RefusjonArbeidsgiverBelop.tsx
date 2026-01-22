import { useCallback } from 'react';
import { Alert, BodyLong } from '@navikt/ds-react';
import { useFormContext, useController } from 'react-hook-form';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import localStyles from './RefusjonArbeidsgiver.module.css';
import ButtonEndre from '../ButtonEndre';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import NumberField from '../NumberField/NumberField';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import stringishToNumber from '../../utils/stringishToNumber';

interface RefusjonArbeidsgiverBelopProps {
  arbeidsgiverperiodeDisabled?: boolean;
}

export default function RefusjonArbeidsgiverBelop({
  arbeidsgiverperiodeDisabled = false
}: Readonly<RefusjonArbeidsgiverBelopProps>) {
  const {
    control,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext();

  const { field } = useController({
    name: 'refusjon.beloepPerMaaned',
    control
  });

  const isEditing = watch('refusjon.isEditing');
  const error = findErrorInRHFErrors('refusjon.beloepPerMaaned', errors);

  const refusjonTilArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Refusjon til arbeidsgiver i sykefraværet'
    : 'Refusjon til arbeidsgiver etter arbeidsgiverperiode';

  const handleButtonEndreBeloepClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      setValue('refusjon.isEditing', true);
    },
    [setValue]
  );

  const handleBeloepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      field.onChange(value === '' ? undefined : stringishToNumber(value));
    },
    [field]
  );

  if (!isEditing) {
    return (
      <>
        <TextLabel>{refusjonTilArbeidsgiverEtterAgpLegend}</TextLabel>
        <BodyLong>
          Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil
          refundere opp til 6G av årslønn.
        </BodyLong>
        <div className={localStyles.beloepswrapper}>
          <div className={localStyles.beloep} data-cy='refusjon-arbeidsgiver-beloep'>
            {formatCurrency(field.value)}&nbsp;kr/måned
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
        <NumberField
          className={localStyles.refusjonBeloep}
          label='Oppgi refusjonsbeløpet per måned'
          {...field}
          onChange={handleBeloepChange}
          id={ensureValidHtmlId('refusjon.beloepPerMaaned')}
          error={error}
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
