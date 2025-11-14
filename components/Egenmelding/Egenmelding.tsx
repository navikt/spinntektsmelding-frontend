import { Alert, BodyLong, Button } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import Heading3 from '../Heading3/Heading3';
import useBoundStore from '../../state/useBoundStore';
import EgenmeldingPeriode from './EgenmeldingPeriode';
import ButtonEndre from '../ButtonEndre';
import { useMemo } from 'react';
import Feilmelding from '../Feilmelding';
import logEvent from '../../utils/logEvent';
import ButtonTilbakestill from '../ButtonTilbakestill';
import EgenmeldingLoader from './EgenmeldingLoader';
import { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import PeriodeType from '../../config/PeriodeType';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface EgenmeldingProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  selvbestemtInnsending?: boolean;
}

export default function Egenmelding({ lasterData, setIsDirtyForm, selvbestemtInnsending }: Readonly<EgenmeldingProps>) {
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const kanEndreEgenmeldingPeriode = useBoundStore((state) => state.kanEndreEgenmeldingPeriode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);
  const tilbakestillEgenmelding = useBoundStore((state) => state.tilbakestillEgenmelding);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);

  const foersteFravaersdag = useMemo(
    () =>
      !sykmeldingsperioder
        ? new Date()
        : sykmeldingsperioder
            .map((periode) => periode.fom)
            .reduce(
              (prevDate, curDate) => ((curDate || new Date()) <= (prevDate || new Date()) ? curDate : prevDate),
              new Date()
            ),
    [sykmeldingsperioder]
  );

  const sisteFravaersdag = useMemo(
    () =>
      !sykmeldingsperioder
        ? new Date()
        : sykmeldingsperioder
            .map((periode) => periode.tom)
            .reduce(
              (prevDate, curDate) => ((curDate || new Date()) >= (prevDate || new Date()) ? curDate : prevDate),
              new Date(0)
            ),
    [sykmeldingsperioder]
  );

  const clickSlettEgenmeldingsperiode = (periode: string) => {
    logEvent('knapp klikket', {
      tittel: 'Slett egenmeldingsperioder',
      component: 'Egenmelding'
    });
    setIsDirtyForm(true);
    slettEgenmeldingsperiode(periode);
  };

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Legg til egenmeldingsperioder',
      component: 'Egenmelding'
    });
    setIsDirtyForm(true);
    leggTilEgenmeldingsperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre egenmeldingsperioder',
      component: 'Egenmelding'
    });

    setEndreEgenmelding(true);
  };

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Tilbakestill egenmeldingsperioder',
      component: 'Egenmelding'
    });

    tilbakestillEgenmelding();
  };

  const setEgenmeldingDatofelt = (dato: PeriodeParam | undefined, id: string) => {
    setIsDirtyForm(true);
    setEgenmeldingDato(dato, id);
  };

  const ikkeEgenmeldingPerioder = !egenmeldingsperioder || egenmeldingsperioder.length === 0;

  const periodeKanEndres = kanEndreEgenmeldingPeriode || skjemastatus === SkjemaStatus.SELVBESTEMT;

  return (
    <div className={localStyles.egenmeldingWrapper}>
      <Heading3>Egenmelding</Heading3>
      <BodyLong>
        {!selvbestemtInnsending && (
          <>
            Hvis den ansatte har oppgitt egenmeldingsdager i forkant av sykmeldingen, er disse forhåndsutfylt og må
            kontrolleres av deg. Alle egenmeldingsperioder som har mindre enn 16 dagers mellomrom før sykmeldingen skal
            inkluderes.
          </>
        )}
        {selvbestemtInnsending && (
          <>
            Oppgi om den ansatte har brukt egenmeldingsdager i forkant til sykmeldingen. Alle egenmeldingsperioder med
            mindre enn 16 dagers mellomrom før sykmeldingen skal inkluderes. Du kan endre og legge til
            egenmeldingsperioder.
          </>
        )}
      </BodyLong>
      {endretArbeidsgiverperiode && (
        <Alert variant='info'>
          Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.
        </Alert>
      )}
      <div>
        <div className={localStyles.egenmeldingWrapper}>
          {lasterData && <EgenmeldingLoader />}
          {!lasterData &&
            egenmeldingsperioder &&
            egenmeldingsperioder.length > 0 &&
            egenmeldingsperioder.map((egenmeldingPeriode, index) => (
              <EgenmeldingPeriode
                key={egenmeldingPeriode.id}
                periodeId={egenmeldingPeriode.id}
                egenmeldingsperiode={egenmeldingPeriode}
                kanEndreEgenmeldingPeriode={periodeKanEndres}
                setEgenmeldingDato={setEgenmeldingDatofelt}
                kanSlettes={!!(egenmeldingPeriode.fom || egenmeldingPeriode.tom || index !== 0)}
                onSlettRad={() => clickSlettEgenmeldingsperiode(egenmeldingPeriode.id)}
                disabled={endretArbeidsgiverperiode}
                rad={index}
                visFeilmeldingTekst={visFeilmeldingTekst}
                defaultMonth={foersteFravaersdag}
                toDate={sisteFravaersdag || new Date()}
              />
            ))}
          {!lasterData && ikkeEgenmeldingPerioder && (
            <EgenmeldingPeriode
              key={PeriodeType.NY_PERIODE}
              periodeId={PeriodeType.NY_PERIODE}
              egenmeldingsperiode={{ id: PeriodeType.NY_PERIODE }}
              kanEndreEgenmeldingPeriode={true}
              setEgenmeldingDato={setEgenmeldingDatofelt}
              kanSlettes={false}
              onSlettRad={() => {}}
              disabled={endretArbeidsgiverperiode}
              rad={0}
              visFeilmeldingTekst={visFeilmeldingTekst}
              defaultMonth={foersteFravaersdag}
              toDate={sisteFravaersdag || new Date()}
            />
          )}
        </div>

        {visFeilmelding('agp.egenmeldinger') && (
          <Feilmelding id={ensureValidHtmlId('agp.egenmeldinger')}>
            {visFeilmeldingTekst('agp.egenmeldinger')}
          </Feilmelding>
        )}
        {visFeilmelding('egenmeldingsperioder-feil') && (
          <Feilmelding id={ensureValidHtmlId('egenmeldingsperioder-feil')}>
            {visFeilmeldingTekst('egenmeldingsperioder-feil')}
          </Feilmelding>
        )}
        {!kanEndreEgenmeldingPeriode && skjemastatus !== SkjemaStatus.SELVBESTEMT && (
          <div className={localStyles.endresykemeldingknapper}>
            <ButtonEndre onClick={clickEndreFravaersperiodeHandler} disabled={endretArbeidsgiverperiode} />
          </div>
        )}
        {(kanEndreEgenmeldingPeriode || skjemastatus === SkjemaStatus.SELVBESTEMT) && (
          <div className={localStyles.endresykemeldingknapper}>
            <Button
              variant='secondary'
              className={styles.kontrollerknapp}
              onClick={clickLeggTilFravaersperiodeHandler}
              disabled={endretArbeidsgiverperiode}
            >
              Legg til periode
            </Button>

            <ButtonTilbakestill
              className={styles.kontrollerknapp}
              onClick={clickTilbakestillFravaersperiodeHandler}
              disabled={endretArbeidsgiverperiode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
