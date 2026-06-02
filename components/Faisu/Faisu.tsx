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
  inntekt?: number;
  stillingsprosent?: number;
  yrkesKode?: string;
  yrkesbeskrivelse?: string;
  inkludertISykefravaer?: boolean;
}

interface FaisuSkjema {
  harLikLoenn?: 'Ja' | 'Nei';
  erSykmeldtFraAlle?: 'Ja' | 'Nei';
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
  } = useFormContext<{ flereArbeidsforhold?: FaisuSkjema }>();

  const harLikLoenn = useWatch({ control, name: 'flereArbeidsforhold.harLikLoenn' });
  const erSykmeldtFraAlle = useWatch({
    control,
    name: 'flereArbeidsforhold.erSykmeldtFraAlle'
  });
  const rawArbeidsforholdListe = useWatch({ control, name: 'flereArbeidsforhold.arbeidsforhold' });
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
      arbeidsforholdListe
        .map((af, index) => (af.inkludertISykefravaer ? String(index) : null))
        .filter((value): value is string => value !== null),
    [arbeidsforholdListe]
  );

  if (!harGradertSykmeldingOgFlereArbeidsforhold) {
    return null;
  }

  const handleLikInntektCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('flereArbeidsforhold.harLikLoenn', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('flereArbeidsforhold.erSykmeldtFraAlle', undefined, {
        shouldDirty: true,
        shouldValidate: true
      });
      setValue('flereArbeidsforhold.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleAlleArbeidsforholdCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('flereArbeidsforhold.erSykmeldtFraAlle', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue('flereArbeidsforhold.arbeidsforhold', [], { shouldDirty: true, shouldValidate: true });
    } else {
      setValue('flereArbeidsforhold.arbeidsforhold', originalArbeidsforhold.current, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  };

  const handleArbeidsforholdCheckboxCheck = (values: string[]) => {
    arbeidsforholdListe.forEach((_, index) => {
      setValue(
        `flereArbeidsforhold.arbeidsforhold.${index}.inkludertISykefravaer` as any,
        values.includes(String(index)),
        {
          shouldDirty: true,
          shouldValidate: true
        }
      );
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

  const handleFeltChange = (index: number, felt: 'inntekt' | 'stillingsprosent', rawValue: string) => {
    const parsedValue = parseNumberInput(rawValue);

    setValue(`flereArbeidsforhold.arbeidsforhold.${index}.${felt}` as any, parsedValue, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleCheckboxChange = (index: number, value: boolean) => {
    setValue(`flereArbeidsforhold.arbeidsforhold.${index}.inkludertISykefravaer` as any, value, {
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
        name='flereArbeidsforhold.harLikLoenn'
        control={control}
        defaultValue={undefined}
        render={({ field }) => (
          <RadioGroup
            legend='Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?'
            className={localStyles.radiobuttonWrapper}
            onChange={(value) => handleLikInntektCheckboxChange(value as 'Ja' | 'Nei')}
            value={field.value ?? ''}
            error={fieldStateErrorMessage(errors, 'flereArbeidsforhold.harLikLoenn')}
          >
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </RadioGroup>
        )}
      />
      {harLikLoenn === 'Nei' && (
        <>
          <Controller
            name='flereArbeidsforhold.erSykmeldtFraAlle'
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <RadioGroup
                legend='Er personen sykmeldt fra alle arbeidsforhold?'
                className={localStyles.radiobuttonWrapper}
                onChange={(value) => handleAlleArbeidsforholdCheckboxChange(value as 'Ja' | 'Nei')}
                value={field.value ?? ''}
                error={fieldStateErrorMessage(errors, 'flereArbeidsforhold.erSykmeldtFraAlle')}
              >
                <Radio value='Ja'>Ja</Radio>
                <Radio value='Nei'>Nei</Radio>
              </RadioGroup>
            )}
          />
          {erSykmeldtFraAlle === 'Nei' && (
            <>
              <Controller
                name='flereArbeidsforhold.arbeidsforhold'
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
                      const label = arbeidsforhold.yrkesbeskrivelse ?? arbeidsforhold.yrkesKode;

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
                            value={arbeidsforhold.inntekt}
                            error={fieldStateErrorMessage(
                              errors,
                              `flereArbeidsforhold.arbeidsforhold.${index}.inntekt`
                            )}
                            onChange={(event) => {
                              handleFeltChange(index, 'inntekt', event.target.value);
                            }}
                          />
                          <NumberField
                            className={localStyles.inputInntekt}
                            label={`Stillingsprosent for ${label}`}
                            value={arbeidsforhold.stillingsprosent}
                            error={fieldStateErrorMessage(
                              errors,
                              `flereArbeidsforhold.arbeidsforhold.${index}.stillingsprosent`
                            )}
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
                    arbeidsforholdListe.reduce((acc, arbeidsforhold) => acc + (arbeidsforhold.inntekt ?? 0), 0)
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
