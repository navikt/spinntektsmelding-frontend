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
import { subDays } from 'date-fns';
import ButtonTilbakestill from '../ButtonTilbakestill';
import EgenmeldingLoader from './EgenmeldingLoader';
import { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import PeriodeType from '../../config/PeriodeType';

interface EgenmeldingProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function Egenmelding({ lasterData, setIsDirtyForm }: Readonly<EgenmeldingProps>) {
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);

  const forsteFravaersdag = useMemo(
    () =>
      !fravaersperioder
        ? new Date()
        : fravaersperioder
            .map((periode) => periode.fom)
            .reduce((prevDate, curDate) => ((curDate || new Date()) <= (prevDate || new Date()) ? curDate : prevDate)),
    [fravaersperioder]
  );

  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const kanEndreEgenmeldingPeriode = useBoundStore((state) => state.kanEndreEgenmeldingPeriode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);
  const tilbakestillEgenmelding = useBoundStore((state) => state.tilbakestillEgenmelding);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

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

  const sisteGyldigeEgenmeldingDato = useMemo(() => {
    const sortertArbeidsgiverperiode = arbeidsgiverperioder
      ? [...arbeidsgiverperioder].sort((a, b) => ((a.fom || new Date()) > (b.fom || new Date()) ? -1 : 1))
      : [];
    return sortertArbeidsgiverperiode && sortertArbeidsgiverperiode?.[0]?.tom
      ? sortertArbeidsgiverperiode?.[0]?.tom
      : new Date();
  }, [arbeidsgiverperioder]);

  const ikkeEgenmeldingPerioder = !egenmeldingsperioder || egenmeldingsperioder.length === 0;

  const periodeKanEndres = kanEndreEgenmeldingPeriode || skjemastatus === SkjemaStatus.SELVBESTEMT;

  return (
    <div className={localStyles.egenmeldingWrapper}>
      <Heading3>Egenmelding</Heading3>
      <BodyLong>
        Hvis den ansatte har oppgitt at egenmeldingsdager ble benyttet i forkant av sykmeldingen, er disse
        forhåndsutfylt her og må kontrolleres av dere. Alle egenmeldingsperioder som har mindre enn 16 dagers mellomrom
        før sykmeldingen skal inkluderes. Dere kan endre og legge til egenmeldingsperioder.
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
                // toDate={forsteFravaersdag ? subDays(forsteFravaersdag, 1) : new Date()}
                toDate={sisteGyldigeEgenmeldingDato}
                kanSlettes={!!(egenmeldingPeriode.fom || egenmeldingPeriode.tom || index !== 0)}
                onSlettRad={() => clickSlettEgenmeldingsperiode(egenmeldingPeriode.id)}
                disabled={endretArbeidsgiverperiode}
                rad={index}
                visFeilmeldingsTekst={visFeilmeldingsTekst}
              />
            ))}
          {!lasterData && ikkeEgenmeldingPerioder && (
            <EgenmeldingPeriode
              key={PeriodeType.NY_PERIODE}
              periodeId={PeriodeType.NY_PERIODE}
              egenmeldingsperiode={{ id: PeriodeType.NY_PERIODE }}
              kanEndreEgenmeldingPeriode={true}
              setEgenmeldingDato={setEgenmeldingDatofelt}
              toDate={forsteFravaersdag ? subDays(forsteFravaersdag, 1) : new Date()}
              kanSlettes={false}
              onSlettRad={() => {}}
              disabled={endretArbeidsgiverperiode}
              rad={0}
              visFeilmeldingsTekst={visFeilmeldingsTekst}
            />
          )}
        </div>

        {visFeilmelding('egenmeldingsperioder-feil') && (
          <Feilmelding id='egenmeldingsperioder-feil'>{visFeilmeldingsTekst('egenmeldingsperioder-feil')}</Feilmelding>
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
