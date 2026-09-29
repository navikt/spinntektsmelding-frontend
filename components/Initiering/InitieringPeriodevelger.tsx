import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import type { ControllerRenderProps, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { Forespoersel } from '../../schema/EndepunktSykepengesoeknaderSchema';
import type { SykepengePeriode } from '../../utils/useInitieringData';
import formatDate from '../../utils/formatDate';
import parseIsoDate from '../../utils/parseIsoDate';
import { formaterEgenmeldingsdager } from '../../utils/initieringPerioder';

type Props = Readonly<{
  control: any;
  errors: FieldErrors<any>;
  forespoersler: Forespoersel[];
  perioder: SykepengePeriode[];
  disablePeriodeCheck: boolean;
  visUtenKobling?: boolean;
  checkboxGroupClassName?: string;
  onRadioChange: (value: string, field: ControllerRenderProps<any, 'forespurtSykepengePeriodeId'>) => void;
  onCheckboxChange?: (value: string[], field: ControllerRenderProps<any, 'sykepengePeriodeId'>) => void;
}>;

export default function InitieringPeriodevelger({
  control,
  errors,
  forespoersler,
  perioder,
  disablePeriodeCheck,
  visUtenKobling = false,
  checkboxGroupClassName,
  onRadioChange,
  onCheckboxChange
}: Props) {
  return (
    <Controller
      name='forespurtSykepengePeriodeId'
      control={control}
      render={({ field }) => (
        <RadioGroup
          legend={
            visUtenKobling && forespoersler.length === 0 && perioder.length === 0
              ? 'Velg hva du vil gjøre videre:'
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
            <Radio value='andrePerioder'>Eller velg en annen periode du vil sende inntektsmelding for:</Radio>
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
                onChange={(value) =>
                  onCheckboxChange ? onCheckboxChange(value, periodeField) : periodeField.onChange(value)
                }
                onBlur={periodeField.onBlur}
                ref={periodeField.ref}
                className={checkboxGroupClassName}
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
