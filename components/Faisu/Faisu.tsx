import { Fragment, useEffect, useMemo, useRef } from 'react';
import { BodyLong, Button, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Skillelinje from '../Skillelinje/Skillelinje';
import localStyles from './Faisu.module.css';
import NumberField from '../NumberField/NumberField';
import Datovelger from '../Datovelger';
import { addDays, format, parseISO, isValid } from 'date-fns';
import { Controller, FieldErrors, useFormContext, useWatch } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import formatCurrency from '../../utils/formatCurrency';
import ButtonSlette from '../ButtonSlette';

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
  arbeidsforholdPerSykmeldingStartdato?: Record<string, Array<FaisuArbeidsforholdSkjema>>;
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
  const rawArbeidsforholdMap = useWatch({
    control,
    name: 'flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato'
  });

  const arbeidsforholdListe = useMemo<
    Array<{ startdatoKey: string; arbeidsforholdIndex: number; arbeidsforhold: FaisuArbeidsforholdSkjema }>
  >(
    () =>
      Object.entries(rawArbeidsforholdMap ?? {}).flatMap(([startdatoKey, arbeidsforholdArray]) =>
        (arbeidsforholdArray ?? []).map((arbeidsforhold, arbeidsforholdIndex) => ({
          startdatoKey,
          arbeidsforholdIndex,
          arbeidsforhold
        }))
      ),
    [rawArbeidsforholdMap]
  );

  const originalArbeidsforhold = useRef<Record<string, Array<FaisuArbeidsforholdSkjema>>>({});
  useEffect(() => {
    if (arbeidsforholdListe.length > 0 && Object.keys(originalArbeidsforhold.current).length === 0) {
      originalArbeidsforhold.current = rawArbeidsforholdMap ?? {};
    }
  }, [arbeidsforholdListe, rawArbeidsforholdMap]);

  const checkedArbeidsforholdIder = useMemo(
    () =>
      arbeidsforholdListe
        .map((entry) =>
          entry.arbeidsforhold.inkludertISykefravaer ? `${entry.startdatoKey}:${entry.arbeidsforholdIndex}` : null
        )
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
      setValue(
        'flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato',
        {},
        {
          shouldDirty: true,
          shouldValidate: true
        }
      );
    }
  };

  const handleAlleArbeidsforholdCheckboxChange = (value: 'Ja' | 'Nei') => {
    setValue('flereArbeidsforhold.erSykmeldtFraAlle', value, { shouldDirty: true, shouldValidate: true });
    if (value === 'Ja') {
      setValue(
        'flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato',
        {},
        {
          shouldDirty: true,
          shouldValidate: true
        }
      );
    } else {
      setValue('flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato', originalArbeidsforhold.current, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  };

  const handleArbeidsforholdCheckboxCheck = (values: string[]) => {
    arbeidsforholdListe.forEach((entry) => {
      setValue(
        `flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato.${entry.startdatoKey}.${entry.arbeidsforholdIndex}.inkludertISykefravaer` as any,
        values.includes(`${entry.startdatoKey}:${entry.arbeidsforholdIndex}`),
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

  const handleFeltChange = (
    startdatoKey: string,
    arbeidsforholdIndex: number,
    felt: 'inntekt' | 'stillingsprosent',
    rawValue: string
  ) => {
    const parsedValue = parseNumberInput(rawValue);

    setValue(
      `flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato.${startdatoKey}.${arbeidsforholdIndex}.${felt}` as any,
      parsedValue,
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  };

  const handleNokkelEndring = (gammelNokkel: string, nyNokkel: string) => {
    if (!nyNokkel || gammelNokkel === nyNokkel) {
      return;
    }

    const eksisterende = rawArbeidsforholdMap ? { ...rawArbeidsforholdMap } : {};
    const verdi = eksisterende[gammelNokkel];

    if (!verdi) {
      return;
    }

    delete eksisterende[gammelNokkel];
    eksisterende[nyNokkel] = verdi;

    setValue('flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato', eksisterende, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleCheckboxChange = (startdatoKey: string, arbeidsforholdIndex: number, value: boolean) => {
    setValue(
      `flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato.${startdatoKey}.${arbeidsforholdIndex}.inkludertISykefravaer` as any,
      value,
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  };

  const leggTilNyPeriode = () => {
    const eksisterende = rawArbeidsforholdMap ? { ...rawArbeidsforholdMap } : {};
    const eksisterendeNokler = Object.keys(eksisterende);
    const forrigeNokkel = eksisterendeNokler.at(-1);
    const forrigeDato = forrigeNokkel ? parseISO(forrigeNokkel) : undefined;
    const basisDato = forrigeDato && isValid(forrigeDato) ? addDays(forrigeDato, 1) : new Date();
    const opptatteNokler = new Set(eksisterendeNokler);

    let nyStartdato = basisDato;
    let nyNokkel = format(nyStartdato, 'yyyy-MM-dd');
    while (opptatteNokler.has(nyNokkel)) {
      nyStartdato = addDays(nyStartdato, 1);
      nyNokkel = format(nyStartdato, 'yyyy-MM-dd');
    }

    const forrigePeriode = Object.values(eksisterende).at(-1);

    eksisterende[nyNokkel] = forrigePeriode?.map((arbeidsforhold) => ({
      ...arbeidsforhold,
      inkludertISykefravaer: false
    })) ?? [
      {
        inntekt: undefined,
        stillingsprosent: undefined,
        yrkesbeskrivelse: undefined,
        inkludertISykefravaer: false
      }
    ];

    setValue('flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato', eksisterende, {
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
                name='flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato'
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
                    {arbeidsforholdListe.map((entry, index) => {
                      const arbeidsforhold = entry.arbeidsforhold;
                      const label = arbeidsforhold.yrkesbeskrivelse ?? arbeidsforhold.yrkesKode;
                      const forrigeEntry = index > 0 ? arbeidsforholdListe[index - 1] : undefined;
                      const visDatovelger = forrigeEntry?.startdatoKey !== entry.startdatoKey;

                      return (
                        <Fragment key={`${entry.startdatoKey}-${entry.arbeidsforholdIndex}`}>
                          {visDatovelger && (
                            <Datovelger
                              label='Sykmelding startdato'
                              defaultSelected={
                                isValid(parseISO(entry.startdatoKey)) ? parseISO(entry.startdatoKey) : undefined
                              }
                              onDateChange={(date) => {
                                if (date) {
                                  handleNokkelEndring(entry.startdatoKey, format(date, 'yyyy-MM-dd'));
                                }
                              }}
                            />
                          )}
                          <div
                            key={`${entry.startdatoKey}-${entry.arbeidsforholdIndex}`}
                            className={localStyles.arbeidsforholdRad}
                          >
                            <Checkbox
                              className={localStyles.arbeidsforholdCheckbox}
                              value={`${entry.startdatoKey}:${entry.arbeidsforholdIndex}`}
                              onChange={(e) =>
                                handleCheckboxChange(entry.startdatoKey, entry.arbeidsforholdIndex, e.target.checked)
                              }
                            >
                              {label}
                            </Checkbox>
                            <NumberField
                              className={localStyles.inputInntekt}
                              label={`Månedslønn for ${label}`}
                              value={arbeidsforhold.inntekt}
                              error={fieldStateErrorMessage(
                                errors,
                                `flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato.${entry.startdatoKey}.${entry.arbeidsforholdIndex}.inntekt`
                              )}
                              onChange={(event) => {
                                handleFeltChange(
                                  entry.startdatoKey,
                                  entry.arbeidsforholdIndex,
                                  'inntekt',
                                  event.target.value
                                );
                              }}
                            />
                            <NumberField
                              className={localStyles.inputInntekt}
                              label={`Stillingsprosent for ${label}`}
                              value={arbeidsforhold.stillingsprosent}
                              error={fieldStateErrorMessage(
                                errors,
                                `flereArbeidsforhold.arbeidsforholdPerSykmeldingStartdato.${entry.startdatoKey}.${entry.arbeidsforholdIndex}.stillingsprosent`
                              )}
                              onChange={(event) => {
                                handleFeltChange(
                                  entry.startdatoKey,
                                  entry.arbeidsforholdIndex,
                                  'stillingsprosent',
                                  event.target.value
                                );
                              }}
                            />
                          </div>
                        </Fragment>
                      );
                    })}
                    <ButtonSlette title='Slett periode' />
                  </CheckboxGroup>
                )}
              />
              <div className={localStyles.arbeidsforholdRad}>
                <div className={localStyles.arbeidsforholdCheckbox}></div>
                <div className={localStyles.outputInntekt}>
                  {formatCurrency(
                    arbeidsforholdListe.reduce((acc, entry) => acc + (entry.arbeidsforhold.inntekt ?? 0), 0)
                  )}
                </div>
                <div className={localStyles.outputInntekt}>
                  {arbeidsforholdListe.reduce((acc, entry) => acc + (entry.arbeidsforhold.stillingsprosent ?? 0), 0)} %
                </div>
              </div>
              <Button variant='secondary' className={localStyles.legtilbutton} onClick={leggTilNyPeriode} type='button'>
                Legg til periode
              </Button>
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
