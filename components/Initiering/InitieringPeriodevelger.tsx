import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import type { ReactNode } from 'react';
import type { ControllerRenderProps, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { Forespoersel } from '../../schema/EndepunktSykepengesoeknaderSchema';
import type { SykepengePeriode } from '../../utils/useInitieringData';
import formatDate from '../../utils/formatDate';
import parseIsoDate from '../../utils/parseIsoDate';

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
  renderPeriode: (periode: SykepengePeriode) => ReactNode;
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
  onCheckboxChange,
  renderPeriode
}: Props) {
  return (
    <Controller
      name='forespurtSykepengePeriodeId'
      control={control}
      render={({ field }) => (
        <RadioGroup
          legend='Nav har bedt om inntektsmelding for disse periodene:'
          id='forespurtSykepengePeriodeId'
          error={errors.forespurtSykepengePeriodeId?.message as string}
          value={field.value ?? ''}
          onChange={(value) => onRadioChange(value, field)}
          onBlur={field.onBlur}
          ref={field.ref}
        >
          {forespoersler.map((forespoersel) => (
            <Radio key={forespoersel.forespoerselId} value={forespoersel.forespoerselId}>
              {forespoersel.sykmeldingsperioder.map((periode) => (
                <span key={periode.fom}>
                  {formatDate(parseIsoDate(periode.fom))} - {formatDate(parseIsoDate(periode.tom))}{' '}
                </span>
              ))}
              {forespoersel.egenmeldingsperioder && forespoersel.egenmeldingsperioder.length > 0 && (
                <>
                  <br />
                  Egenmeldingsperiode:
                  {forespoersel.egenmeldingsperioder.map((periode) => (
                    <span key={periode.fom}>
                      {formatDate(parseIsoDate(periode.fom))} - {formatDate(parseIsoDate(periode.tom))}{' '}
                    </span>
                  ))}
                  <br />
                </>
              )}
              {!!forespoersel.erBesvart && ' (Besvart)'}
            </Radio>
          ))}
          <Radio value='andrePerioder'>Eller velg en annen periode du vil sende inntektsmelding for:</Radio>
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
                    {renderPeriode(periode)}
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
