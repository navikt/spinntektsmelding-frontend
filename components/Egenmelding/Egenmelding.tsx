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
import { addDays, differenceInCalendarDays, isBefore, isValid, subDays } from 'date-fns';
import ButtonTilbakestill from '../ButtonTilbakestill';
import EgenmeldingLoader from './EgenmeldingLoader';
import { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import PeriodeType from '../../config/PeriodeType';
import sorterFomStigende from '../../utils/sorterFomStigende';

interface EgenmeldingProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  selvbestemtInnsending?: boolean;
}

export default function Egenmelding({ lasterData, setIsDirtyForm, selvbestemtInnsending }: Readonly<EgenmeldingProps>) {
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);

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

  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const kanEndreEgenmeldingPeriode = useBoundStore((state) => state.kanEndreEgenmeldingPeriode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);
  const tilbakestillEgenmelding = useBoundStore((state) => state.tilbakestillEgenmelding);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
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
    const totaltAntallEgenmeldingsdagerDager =
      egenmeldingsperioder?.reduce((acc, periode) => {
        if (!isValid(periode.fom) || !isValid(periode.tom)) {
          return acc;
        }

        const dagerIPeriode = differenceInCalendarDays(periode.tom!, periode.fom!) + 1;
        return acc + dagerIPeriode;
      }, 0) ?? 0;

    let egenmeldingDag =
      egenmeldingsperioder?.filter((periode) => periode.fom && periode.tom).toSorted(sorterFomStigende)?.[0]?.tom ||
      new Date();
    egenmeldingDag = addDays(
      egenmeldingDag,
      totaltAntallEgenmeldingsdagerDager < 16 ? 17 - totaltAntallEgenmeldingsdagerDager : 16
    );

    const bareFomPeriode = egenmeldingsperioder?.find((periode) => periode.fom && !periode.tom);

    if (bareFomPeriode) {
      egenmeldingDag = addDays(bareFomPeriode.fom!, 15 - totaltAntallEgenmeldingsdagerDager);
    }

    const sortertArbeidsgiverperiode = arbeidsgiverperioder
      ? [...arbeidsgiverperioder].sort((a, b) => ((a.fom || new Date()) > (b.fom || new Date()) ? -1 : 1))
      : [];
    const agpDag = sortertArbeidsgiverperiode?.[sortertArbeidsgiverperiode.length - 1]?.tom
      ? sortertArbeidsgiverperiode?.[0]?.tom
      : new Date();

    return isBefore(agpDag!, egenmeldingDag) ? agpDag : egenmeldingDag;
  }, [arbeidsgiverperioder, egenmeldingsperioder]);

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
                // toDate={foersteFravaersdag ? subDays(foersteFravaersdag, 1) : new Date()}
                toDate={sisteGyldigeEgenmeldingDato!}
                kanSlettes={!!(egenmeldingPeriode.fom || egenmeldingPeriode.tom || index !== 0)}
                onSlettRad={() => clickSlettEgenmeldingsperiode(egenmeldingPeriode.id)}
                disabled={endretArbeidsgiverperiode}
                rad={index}
                visFeilmeldingTekst={visFeilmeldingTekst}
              />
            ))}
          {!lasterData && ikkeEgenmeldingPerioder && (
            <EgenmeldingPeriode
              key={PeriodeType.NY_PERIODE}
              periodeId={PeriodeType.NY_PERIODE}
              egenmeldingsperiode={{ id: PeriodeType.NY_PERIODE }}
              kanEndreEgenmeldingPeriode={true}
              setEgenmeldingDato={setEgenmeldingDatofelt}
              toDate={foersteFravaersdag ? subDays(foersteFravaersdag, 1) : new Date()}
              kanSlettes={false}
              onSlettRad={() => {}}
              disabled={endretArbeidsgiverperiode}
              rad={0}
              visFeilmeldingTekst={visFeilmeldingTekst}
            />
          )}
        </div>

        {visFeilmelding('egenmeldingsperioder-feil') && (
          <Feilmelding id='egenmeldingsperioder-feil'>{visFeilmeldingTekst('egenmeldingsperioder-feil')}</Feilmelding>
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
