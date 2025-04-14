import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { Button, TextField } from '@navikt/ds-react';
import SelectEndringBruttoinntekt from './SelectEndringBruttoinntekt';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import { Inntekt } from '../../state/state';
import React, { Fragment, useEffect } from 'react';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import AarsakDetaljer from './AarsakDetaljer';
import { useFieldArray, useFormContext } from 'react-hook-form';
import stringishToNumber from '../../utils/stringishToNumber';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ButtonSlette from '../ButtonSlette';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  visFeilmeldingTekst: (feilmelding: string) => string;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
  kanIkkeTilbakestilles?: boolean;
}

export default function Aarsaksvelger({
  bruttoinntekt,
  clickTilbakestillMaanedsinntekt,
  visFeilmeldingTekst,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles
}: Readonly<AarsaksvelgerProps>) {
  const handleLeggTilEndringAarsak = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    append({});
  };

  const {
    formState: { errors },
    register,
    control
  } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'inntekt.endringAarsaker' // unique name for your Field Array
  });
  const beloepFeltnavn = 'inntekt.beloep';
  const beloepError = findErrorInRHFErrors(beloepFeltnavn, errors);

  useEffect(() => {
    if (fields.length === 0) {
      replace({});
    }
  }, [fields, replace]);

  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      {fields.map((aarsak, key) => (
        <Fragment key={aarsak.id}>
          <div className={lokalStyles.endremaaanedsinntekt}>
            {key === 0 && (
              <TextField
                label={`Månedslønn ${formatDate(bestemmendeFravaersdag)}`}
                defaultValue={bruttoinntekt?.bruttoInntekt ? formatCurrency(bruttoinntekt.bruttoInntekt) : ''}
                id='inntekt.beregnetInntekt'
                error={beloepError}
                className={lokalStyles.bruttoinntektendringsbeloep}
                data-cy='inntekt-beloep-input'
                {...register('inntekt.beloep', {
                  setValueAs: (value) => stringishToNumber(value)
                })}
              />
            )}
            <div className={lokalStyles.selectEndringBruttoinntektWrapper}>
              <SelectEndringBruttoinntekt
                error={visFeilmeldingTekst('bruttoinntekt-endringsaarsak')}
                id={`inntekt.endringAarsaker.${key}.aarsak`}
                nyInnsending={nyInnsending}
                register={register}
                begrunnelserId={`inntekt.endringAarsaker`}
              />
            </div>
            {!kanIkkeTilbakestilles && key === 0 && (
              <div>
                <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
              </div>
            )}
            {key > 0 && (
              <div>
                <ButtonSlette className={lokalStyles.kontrollerknapp} onClick={() => remove(key)} title={'Slett'} />
              </div>
            )}
          </div>
          <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={key.toString()} />
        </Fragment>
      ))}
      <Button variant='secondary' onClick={handleLeggTilEndringAarsak} className={lokalStyles.leggTilAarsak}>
        Legg til annen endringsårsak
      </Button>
    </div>
  );
}
