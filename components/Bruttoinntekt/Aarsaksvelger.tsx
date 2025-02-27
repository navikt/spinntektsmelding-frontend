import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { Button, TextField } from '@navikt/ds-react';
import SelectEndringBruttoinntekt from './SelectEndringBruttoinntekt';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import { Inntekt, Periode } from '../../state/state';
import React from 'react';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import AarsakDetaljer from './AarsakDetaljer';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  defaultEndringAarsak: EndringAarsak;
  setEndringAarsakGjelderFra: (dato?: Date) => void;
  setEndringAarsakBleKjent: (dato?: Date) => void;
  setPerioder: (periode?: Array<Periode>) => void;
  visFeilmeldingTekst: (feilmelding: string) => string;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
  kanIkkeTilbakestilles?: boolean;
}

export default function Aarsaksvelger({
  bruttoinntekt,
  changeMaanedsintektHandler,
  changeBegrunnelseHandler,
  clickTilbakestillMaanedsinntekt,
  defaultEndringAarsak,
  setEndringAarsakGjelderFra,
  setEndringAarsakBleKjent,
  setPerioder,
  visFeilmeldingTekst,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles
}: Readonly<AarsaksvelgerProps>) {
  const [aarsaker, setAarsaker] = React.useState([1]);

  const handleLeggTilEndringAarsak = (e) => {
    e.preventDefault();
    aarsaker.push(aarsaker.length + 1);
    setAarsaker([...aarsaker]);
  };
  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      {aarsaker.map((aarsak, index) => (
        <>
          <div className={lokalStyles.endremaaanedsinntekt} key={aarsak}>
            {index === 0 && (
              <TextField
                label={`Månedslønn ${formatDate(bestemmendeFravaersdag)}`}
                onChange={changeMaanedsintektHandler}
                defaultValue={bruttoinntekt?.bruttoInntekt ? formatCurrency(bruttoinntekt.bruttoInntekt) : ''}
                id='inntekt.beregnetInntekt'
                error={visFeilmeldingTekst('inntekt.beregnetInntekt')}
                className={lokalStyles.bruttoinntektendringsbeloep}
                data-cy='inntekt-beloep-input'
              />
            )}
            <div className={lokalStyles.selectEndringBruttoinntektWrapper}>
              <SelectEndringBruttoinntekt
                onChangeBegrunnelse={changeBegrunnelseHandler}
                error={visFeilmeldingTekst('bruttoinntekt-endringsaarsak')}
                id='bruttoinntekt-endringsaarsak'
                nyInnsending={nyInnsending}
                value={defaultEndringAarsak?.aarsak as string}
              />
            </div>
            {!kanIkkeTilbakestilles && (
              <div>
                <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
              </div>
            )}
          </div>
          <AarsakDetaljer
            endringAarsak={defaultEndringAarsak}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
            setEndringAarsakBleKjent={setEndringAarsakBleKjent}
            setPerioder={setPerioder}
            visFeilmeldingTekst={visFeilmeldingTekst}
          />
        </>
      ))}
      <Button variant='secondary' onClick={handleLeggTilEndringAarsak} className={lokalStyles.leggTilAarsak}>
        Legg til annen endringsårsak
      </Button>
    </div>
  );
}
