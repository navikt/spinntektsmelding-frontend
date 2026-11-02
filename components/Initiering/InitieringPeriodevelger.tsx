import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';
import type { Forespoersel } from '../../schema/EndepunktSykepengesoeknaderSchema';
import type { SykepengePeriode } from '../../utils/useInitieringData';
import formatDate from '../../utils/formatDate';
import parseIsoDate from '../../utils/parseIsoDate';
import { formaterEgenmeldingsdager } from '../../utils/initieringPerioder';
import useInitieringPeriodevalg, { type PeriodevalgSkjema } from '../../utils/useInitieringPeriodevalg';
import lokalStyling from '../../styles/initiering.module.css';

type Props = Readonly<{
  forespoersler: Forespoersel[];
  perioder: SykepengePeriode[];
  visUtenKobling?: boolean;
}>;

export default function InitieringPeriodevelger({ forespoersler, perioder, visUtenKobling = false }: Props) {
  const {
    control,
    formState: { errors }
  } = useFormContext<PeriodevalgSkjema>();
  const { disablePeriodeCheck, onRadioChange, onCheckboxChange } = useInitieringPeriodevalg(perioder, forespoersler);

  return (
    <Controller
      name='forespurtSykepengePeriodeId'
      control={control}
      render={({ field }) => (
        <RadioGroup
          legend={
            forespoersler.length === 0
              ? 'Hva vil du gjøre videre:'
              : 'Nav har bedt om inntektsmelding for disse periodene:'
          }
          id='forespurtSykepengePeriodeId'
          error={errors.forespurtSykepengePeriodeId?.message as string}
          value={field.value ?? ''}
          onChange={(value) => onRadioChange(value, field)}
          onBlur={field.onBlur}
          ref={field.ref}
        >
          {forespoersler.map((forespoersel) => (
            <Radio key={forespoersel.forespoerselId} value={forespoersel.forespoerselId}>
              {forespoersel.sykmeldingsperioder
                .map((periode) => `${formatDate(parseIsoDate(periode.fom))} - ${formatDate(parseIsoDate(periode.tom))}`)
                .join(', ')}{' '}
              {forespoersel.egenmeldingsperioder && forespoersel.egenmeldingsperioder.length > 0 && (
                <>
                  <br />
                  Egenmeldingsperiode:{' '}
                  {forespoersel.egenmeldingsperioder
                    .map(
                      (periode) => `${formatDate(parseIsoDate(periode.fom))} - ${formatDate(parseIsoDate(periode.tom))}`
                    )
                    .join(', ')}{' '}
                  <br />
                </>
              )}
              {!!forespoersel.erBesvart && ' (Viser kvittering)'}
            </Radio>
          ))}
          {perioder && perioder.length > 0 && (
            <Radio value='andrePerioder'>
              {forespoersler.length === 0
                ? 'Velg en annen periode du vil sende inntektsmelding for:'
                : 'Eller velg en annen periode du vil sende inntektsmelding for:'}
            </Radio>
          )}
          <Controller
            name='sykepengePeriodeId'
            control={control}
            render={({ field: periodeField }) => (
              <CheckboxGroup
                legend='Velg perioden du vil sende inntektsmelding for:'
                hideLegend
                id='sykepengePeriodeId'
                error={errors.sykepengePeriodeId?.message as string}
                value={periodeField.value ?? []}
                onChange={(value) => onCheckboxChange(value, periodeField)}
                onBlur={periodeField.onBlur}
                ref={periodeField.ref}
                className={lokalStyling.checkboxGroup}
              >
                {perioder.map((periode) => (
                  <Checkbox key={periode.id} value={periode.id} disabled={disablePeriodeCheck}>
                    <>
                      {formatDate(periode.fom)} - {formatDate(periode.tom)}
                      <br />
                      {formaterEgenmeldingsdager(periode.egenmeldingsperioder)}
                      {periode.forlengerVedtaksperiodeId && ' (Forlengelse)'}
                    </>
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )}
          />
          {visUtenKobling && <Radio value='utenKobling'>Send inntektsmelding for annen periode</Radio>}
        </RadioGroup>
      )}
    />
  );
}
