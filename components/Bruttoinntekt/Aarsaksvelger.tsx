import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { Button, TextField } from '@navikt/ds-react';
import SelectEndringBruttoinntekt from './SelectEndringBruttoinntekt';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import { Inntekt } from '../../state/state';
import React, { Fragment, useEffect, useMemo } from 'react';
import AarsakDetaljer from './AarsakDetaljer';
import { useFieldArray, useFormContext } from 'react-hook-form';
import stringishToNumber from '../../utils/stringishToNumber';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ButtonSlette from '../ButtonSlette';
import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  handleResetMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  visFeilmeldingTekst: (feilmelding: string) => string;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
  kanIkkeTilbakestilles?: boolean;
}

export default function Aarsaksvelger({
  bruttoinntekt,
  handleResetMaanedsinntekt,
  visFeilmeldingTekst,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles
}: Readonly<AarsaksvelgerProps>) {
  const handleLeggTilEndringAarsak = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    leggTilEndringsaarsak({});
  };

  const {
    formState: { errors },
    register,
    control
  } = useFormContext();

  const {
    fields,
    append: leggTilEndringsaarsak,
    remove: slettEndringsaarsak,
    replace: initialiserEndringsaarsaker
  } = useFieldArray({
    control,
    name: 'inntekt.endringAarsaker'
  });

  const beloepFeltnavn = 'inntekt.beloep';
  const beloepError = findErrorInRHFErrors(beloepFeltnavn, errors);

  const rootError = useMemo(() => {
    const endringAarsakerErrors = (errors as any)?.inntekt?.endringAarsaker;
    if (endringAarsakerErrors && typeof endringAarsakerErrors === 'object' && 'root' in endringAarsakerErrors) {
      const root = (endringAarsakerErrors as any).root;
      return root?.message as string | undefined;
    }
    return undefined;
  }, [errors]);

  useEffect(() => {
    if (fields.length === 0) {
      initialiserEndringsaarsaker([{}]);
    }
  }, [fields.length, initialiserEndringsaarsaker]);
  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      {fields.map((aarsak, key) => (
        <Fragment key={aarsak.id}>
          <div className={lokalStyles.endremaaanedsinntekt}>
            {key === 0 && (
              <TextField
                label={`Månedslønn ${formatDate(bestemmendeFravaersdag)}`}
                defaultValue={bruttoinntekt?.bruttoInntekt ? formatCurrency(bruttoinntekt.bruttoInntekt) : ''}
                id={ensureValidHtmlId('inntekt.beregnetInntekt')}
                error={beloepError}
                className={lokalStyles.bruttoinntektendringsbeloep}
                data-cy='inntekt-beloep-input'
                {...register('inntekt.beloep', {
                  setValueAs: (value) => stringishToNumber(value)
                })}
              />
            )}
            <div className={lokalStyles.selectEndringBruttoinntektWrapper}>
              {rootError && (key === 1 || fields.length === 1) && (
                <p
                  className='navds-error-message navds-label navds-error-message--show-icon'
                  id={ensureValidHtmlId('inntekt.endringAarsaker.root')}
                >
                  <ExclamationmarkTriangleFillIcon />
                  {rootError}
                </p>
              )}
              <SelectEndringBruttoinntekt
                error={visFeilmeldingTekst('bruttoinntekt-endringsaarsak')}
                id={`inntekt.endringAarsaker.${key}.aarsak`}
                nyInnsending={nyInnsending}
                register={register}
                begrunnelserId={`inntekt.endringAarsaker`}
              />
            </div>

            <div>
              <ButtonSlette
                className={lokalStyles.kontrollerknapp}
                onClick={() => slettEndringsaarsak(key)}
                title={'Slett'}
              />
            </div>
            {!kanIkkeTilbakestilles && key === 0 && (
              <div>
                <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={handleResetMaanedsinntekt} />
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
