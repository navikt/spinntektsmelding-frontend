import { useEffect, useMemo, useRef } from 'react';
import { BodyLong, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Skillelinje from '../Skillelinje/Skillelinje';
import localStyles from './Faisu.module.css';
import NumberField from '../NumberField/NumberField';
import { Controller, FieldErrors, useFormContext, useWatch } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import formatCurrency from '../../utils/formatCurrency';

interface FaisuArbeidsforholdSkjema {
  maanedsloenn?: number;
  stillingsprosent?: number;
  yrkesKode?: string;
  yrkesBeskrivelse?: string;
  aktivtSykefravaer?: boolean;
}

interface FaisuSkjema {
  harLikLoenn?: 'Ja' | 'Nei';
  sykmeldtFraAlleArbeidsforhold?: 'Ja' | 'Nei';
  arbeidsforhold?: Array<FaisuArbeidsforholdSkjema>;
}

interface FaisuProps {
  harGradertSykmeldingOgFlereArbeidsforhold?: boolean;
}

export default function Faisu({ harGradertSykmeldingOgFlereArbeidsforhold }: Readonly<FaisuProps>) {
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<{ faisu?: FaisuSkjema }>();

  const harLikLoenn = useWatch({ control, name: 'faisu.harLikLoenn' });
  const sykmeldtFraAlleArbeidsforhold = useWatch({ control, name: 'faisu.sykmeldtFraAlleArbeidsforhold' });
  const rawArbeidsforholdListe = useWatch({ control, name: 'faisu.arbeidsforhold' });
  const arbeidsforholdListe = useMemo<FaisuArbeidsforholdSkjema[]>(
    () => rawArbeidsforholdListe ?? [],
    [rawArbeidsforholdListe]
  );

  const originalArbeidsforhold = useRef<FaisuArbeidsforholdSkjema[]>([]);
  useEffect(() => {
    if (arbeidsforholdListe.length > 0 && originalArbeidsforhold.current.length === 0) {
      originalArbeidsforhold.current = arbeidsforholdListe;
    }
  }, [arbeidsforholdListe]);

  const checkedArbeidsforholdIder = useMemo(
    () =>
      arbeidsforholdListe.map((af, index) => (af.aktivtSykefravaer ? String(index) : null)).filter((v) => v !== null),
    [arbeidsforholdListe]
  );

  if (!harGradertSykmeldingOgFlereArbeidsforhold) {
    return null;
  }

  const handleLikInntektCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('faisu.harLikLoenn', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('faisu.sykmeldtFraAlleArbeidsforhold', undefined, { shouldDirty: true, shouldValidate: true });
      setValue('faisu.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleAlleArbeidsforholdCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('faisu.sykmeldtFraAlleArbeidsforhold', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('faisu.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    } else {
      setValue('faisu.arbeidsforhold', originalArbeidsforhold.current, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleArbeidsforholdCheckboxCheck = (values: string[]) => {
    arbeidsforholdListe.forEach((_, index) => {
      setValue(`faisu.arbeidsforhold.${index}.aktivtSykefravaer` as any, values.includes(String(index)), {
        shouldDirty: true,
        shouldValidate: true
      });
    });
  };

  const parseNumberInput = (rawValue: string): number | undefined => {
    const normalizedValue = rawValue.replace(',', '.');
    if (normalizedValue === '') {
      return undefined;
    }

    const parsedValue = Number(normalizedValue);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  };

  const handleFeltChange = (index: number, felt: 'maanedsloenn' | 'stillingsprosent', rawValue: string) => {
    const parsedValue = parseNumberInput(rawValue);

    setValue(`faisu.arbeidsforhold.${index}.${felt}` as any, parsedValue, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleCheckboxChange = (index: number, value: boolean) => {
    setValue(`faisu.arbeidsforhold.${index}.aktivtSykefravaer` as any, value, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  return (
    <>
      <Skillelinje />
      <Heading1>Månedslønn - Flere arbeidsforhold</Heading1>
      <BodyLong>Det er registrert flere arbeidsforhold i samme underenhet og Nav trenger ekstra informasjon.</BodyLong>
      <Controller
        name='faisu.harLikLoenn'
        control={control}
        defaultValue={undefined}
        render={({ field }) => (
          <RadioGroup
            legend='Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?'
            className={localStyles.radiobuttonWrapper}
            onChange={(value) => handleLikInntektCheckboxChange(value as 'Ja' | 'Nei')}
            value={field.value ?? ''}
            error={fieldStateErrorMessage(errors, 'faisu.harLikLoenn')}
          >
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </RadioGroup>
        )}
      />
      {harLikLoenn === 'Nei' && (
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
                render={({ fieldState }) => (
                  <CheckboxGroup
                    legend='Hvilket arbeidsforhold gjelder sykefraværet for?'
                    onChange={handleArbeidsforholdCheckboxCheck}
                    value={checkedArbeidsforholdIder}
                    error={fieldState.error?.message}
                  >
                    <div className={localStyles.feltOverskrifter}>
                      <BodyLong>Aktive arbeidsforhold</BodyLong>
                      <BodyLong>Månedslønn av beregnet inntekt</BodyLong>
                      <BodyLong>Stillingsprosent i beregningsperioden</BodyLong>
                    </div>
                    {arbeidsforholdListe.map((arbeidsforhold, index) => {
                      const label = arbeidsforhold.yrkesBeskrivelse ?? arbeidsforhold.yrkesKode;

                      return (
                        <div key={'yk' + index} className={localStyles.arbeidsforholdRad}>
                          <Checkbox
                            className={localStyles.arbeidsforholdCheckbox}
                            value={String(index)}
                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                          >
                            {label}
                          </Checkbox>
                          <NumberField
                            className={localStyles.inputInntekt}
                            label={`Månedslønn for ${label}`}
                            value={arbeidsforhold.maanedsloenn}
                            error={fieldStateErrorMessage(errors, `faisu.arbeidsforhold.${index}.maanedsloenn`)}
                            onChange={(event) => {
                              handleFeltChange(index, 'maanedsloenn', event.target.value);
                            }}
                          />
                          <NumberField
                            className={localStyles.inputInntekt}
                            label={`Stillingsprosent for ${label}`}
                            value={arbeidsforhold.stillingsprosent}
                            error={fieldStateErrorMessage(errors, `faisu.arbeidsforhold.${index}.stillingsprosent`)}
                            onChange={(event) => {
                              handleFeltChange(index, 'stillingsprosent', event.target.value);
                            }}
                          />
                        </div>
                      );
                    })}
                  </CheckboxGroup>
                )}
              />
              <div className={localStyles.arbeidsforholdRad}>
                <div className={localStyles.arbeidsforholdCheckbox}></div>
                <div className={localStyles.outputInntekt}>
                  {formatCurrency(
                    arbeidsforholdListe.reduce((acc, arbeidsforhold) => acc + (arbeidsforhold.maanedsloenn ?? 0), 0)
                  )}
                </div>
                <div className={localStyles.outputInntekt}>
                  {arbeidsforholdListe.reduce((acc, arbeidsforhold) => acc + (arbeidsforhold.stillingsprosent ?? 0), 0)}{' '}
                  %
                </div>
              </div>
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
