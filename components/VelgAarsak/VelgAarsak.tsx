import lokalStyles from '../Bruttoinntekt/Bruttoinntekt.module.css';
import formatDate from '../../utils/formatDate';
import { TextField } from '@navikt/ds-react';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import { Periode } from '../../state/state';
import React from 'react';
import PeriodeListevelger from '../PeriodeListeVelger/PeriodeListevelger';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import EndringBruttoinntektAarsak from '../EndringBruttoinntektAarsak/EndringBruttoinntektAarsak';
import stringishToNumber from '../../utils/stringishToNumber';
import TariffendringDato from '../TariffendringDato/TariffendringDato';

interface VelgAarsakProps {
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tariffendringDato?: Date;
  tariffkjentdato?: Date;
  ferie?: Array<Periode>;
  permisjon?: Array<Periode>;
  permittering?: Array<Periode>;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  lonnsendringsdato?: Date;
  sykefravaerperioder?: Array<Periode>;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
  kanIkkeTilbakestilles?: boolean;
}

export default function VelgAarsak({
  clickTilbakestillMaanedsinntekt,
  tariffendringDato,
  tariffkjentdato,
  ferie,
  permisjon,
  permittering,
  nystillingdato,
  nystillingsprosentdato,
  lonnsendringsdato,
  sykefravaerperioder,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles
}: Readonly<VelgAarsakProps>) {
  const {
    formState: { errors },
    watch,
    register
  } = useFormContext();

  const endringAarsak = watch('inntekt.endringAarsak.aarsak');

  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <TextField
          label={`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`}
          // defaultValue={bruttoinntekt?.bruttoInntekt ? formatCurrency(bruttoinntekt?.bruttoInntekt) : ''}
          error={errors.inntekt?.beloep?.message as string}
          className={lokalStyles.bruttoinntektendringsbeloep}
          data-cy='inntekt-beloep-input'
          {...register('inntekt.beloep', {
            setValueAs: (value) => stringishToNumber(value)
          })}
        />
        <div>
          <EndringBruttoinntektAarsak
            name='inntekt.endringAarsak.aarsak'
            nyInnsending={nyInnsending}
            // value={endringAarsak as string}
          />
        </div>
        {!kanIkkeTilbakestilles && (
          <div>
            <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
          </div>
        )}
      </div>
      {endringAarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <TariffendringDato
            defaultEndringsdato={tariffendringDato}
            defaultKjentDato={tariffkjentdato}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.Ferie && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={ferie}
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.perioder'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.VarigLoennsendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Lønnsendring gjelder fra'
            defaultSelected={lonnsendringsdato}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            name='inntekt.endringAarsak.perioder'
            defaultRange={permisjon}
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
          />
        </div>
      )}

      {endringAarsak === begrunnelseEndringBruttoinntekt.Permittering && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={permittering}
            fomTekst='Fra'
            tomTekst='Til'
            name='inntekt.endringAarsak.perioder'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stilling fra'
            defaultSelected={nystillingdato}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stillingsprosent fra'
            defaultSelected={nystillingsprosentdato}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}

      {endringAarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={sykefravaerperioder}
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.perioder'
          />
        </div>
      )}
    </div>
  );
}
