import { BodyLong, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Skillelinje from '../Skillelinje/Skillelinje';
import localStyles from './Faisu.module.css';
import NumberField from '../NumberField/NumberField';
import { Controller, FieldErrors, useFormContext, useWatch } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

const mockData = {
  arbeidsforhold: [
    {
      id: '9132103',
      stillingsprosent: 100,
      beskrivelse: 'RENOLDSARBEIDER',
      maanedslonn: 35000
    },
    {
      id: '9132104',
      stillingsprosent: 50,
      beskrivelse: 'RENOLDSARBEIDER',
      maanedslonn: 17500
    }
  ]
};
interface FaisuProps {
  harGradertSykmeldingOgFlereArbeidsforhold?: boolean;
}

interface FaisuArbeidsforholdSkjema {
  arbeidsforholdId: string;
  maanedslonn?: number;
}

interface FaisuSkjema {
  harLikLonn?: 'Ja' | 'Nei';
  sykmeldtFraAlleArbeidsforhold?: 'Ja' | 'Nei';
  arbeidsforhold?: Array<FaisuArbeidsforholdSkjema>;
}

export default function Faisu({ harGradertSykmeldingOgFlereArbeidsforhold }: Readonly<FaisuProps>) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useFormContext<{ faisu?: FaisuSkjema }>();

  const harLikLonn = useWatch({ control, name: 'faisu.harLikLonn' });
  const sykmeldtFraAlleArbeidsforhold = useWatch({ control, name: 'faisu.sykmeldtFraAlleArbeidsforhold' });
  const valgteArbeidsforhold = useWatch({ control, name: 'faisu.arbeidsforhold' }) ?? [];

  if (!harGradertSykmeldingOgFlereArbeidsforhold) {
    return null;
  }

  const aktuelleArbeidsforhold = mockData.arbeidsforhold.filter((arbeidsforhold) => {
    return valgteArbeidsforhold.some((valgt) => valgt.arbeidsforholdId === arbeidsforhold.id);
  });

  const handleLikInntektCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('faisu.harLikLonn', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('faisu.sykmeldtFraAlleArbeidsforhold', undefined, { shouldDirty: true, shouldValidate: true });
      setValue('faisu.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleAlleArbeidsforholdCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('faisu.sykmeldtFraAlleArbeidsforhold', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('faisu.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleArbeidsforholdCheckboxCheck = (values: string[]) => {
    const eksisterendeArbeidsforhold = getValues('faisu.arbeidsforhold') ?? [];
    const oppdatertArbeidsforhold = values.map((arbeidsforholdId) => {
      const eksisterende = eksisterendeArbeidsforhold.find((item) => item.arbeidsforholdId === arbeidsforholdId);
      return { arbeidsforholdId, maanedslonn: eksisterende?.maanedslonn };
    });

    setValue('faisu.arbeidsforhold', oppdatertArbeidsforhold, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <Skillelinje />
      <Heading1>Månedslønn - Flere arbeidsforhold</Heading1>
      <BodyLong>Det er registrert flere arbeidsforhold i samme underenhet og Nav trenger ekstra informasjon.</BodyLong>
      <Controller
        name='faisu.harLikLonn'
        control={control}
        defaultValue={undefined}
        render={({ field }) => (
          <RadioGroup
            legend='Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?'
            className={localStyles.radiobuttonWrapper}
            onChange={(value) => handleLikInntektCheckboxChange(value as 'Ja' | 'Nei')}
            value={field.value ?? ''}
            error={fieldStateErrorMessage(errors, 'faisu.harLikLonn')}
          >
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </RadioGroup>
        )}
      />
      {harLikLonn === 'Nei' && (
        <>
          <Controller
            name='faisu.sykmeldtFraAlleArbeidsforhold'
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <RadioGroup
                legend='Er personen sykmeldt fra alle arbeidsforhold?'
                className={localStyles.radiobuttonWrapper}
                onChange={(value) => handleAlleArbeidsforholdCheckboxChange(value as 'Ja' | 'Nei')}
                value={field.value ?? ''}
                error={fieldStateErrorMessage(errors, 'faisu.sykmeldtFraAlleArbeidsforhold')}
              >
                <Radio value='Ja'>Ja</Radio>
                <Radio value='Nei'>Nei</Radio>
              </RadioGroup>
            )}
          />
          {sykmeldtFraAlleArbeidsforhold === 'Nei' && (
            <>
              <Controller
                name='faisu.arbeidsforhold'
                control={control}
                rules={{
                  validate: (value) => (value ?? []).length > 0 || 'Vennligst velg minst ett arbeidsforhold.'
                }}
                render={({ fieldState }) => (
                  <CheckboxGroup
                    legend='Hvilket arbeidsforhold gjelder sykefraværet for?'
                    onChange={handleArbeidsforholdCheckboxCheck}
                    value={valgteArbeidsforhold.map((item) => item.arbeidsforholdId)}
                    error={fieldState.error?.message}
                  >
                    {mockData.arbeidsforhold.map((arbeidsforhold) => (
                      <Checkbox key={arbeidsforhold.id} value={arbeidsforhold.id}>
                        {arbeidsforhold.beskrivelse}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                )}
              />
              {aktuelleArbeidsforhold.map((arbeidsforhold) => {
                const valgtIndex = valgteArbeidsforhold.findIndex(
                  (item) => item.arbeidsforholdId === arbeidsforhold.id
                );

                return (
                  <Controller
                    key={`maanedslonn-${arbeidsforhold.id}`}
                    name={`faisu.arbeidsforhold.${valgtIndex}.maanedslonn`}
                    control={control}
                    render={({ field }) => (
                      <NumberField
                        className={localStyles.inputInntekt}
                        label={`Oppgi spesifisert månedslønn for - ${arbeidsforhold.beskrivelse}`}
                        value={field.value}
                        error={fieldStateErrorMessage(errors, `faisu.arbeidsforhold.${valgtIndex}.maanedslonn`)}
                        onChange={(event) => {
                          const value = event.target.value.replace(',', '.');
                          if (value === '') {
                            field.onChange(undefined);
                            return;
                          }

                          const parsedValue = Number(value);
                          field.onChange(Number.isNaN(parsedValue) ? undefined : parsedValue);
                        }}
                      />
                    )}
                  />
                );
              })}
            </>
          )}
        </>
      )}
    </>
  );
}

function fieldStateErrorMessage(errors: FieldErrors, path: string): string | undefined {
  const error = findErrorInRHFErrors(path, errors);
  return typeof error === 'string' ? error : undefined;
}
