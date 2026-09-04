import { useState } from 'react';
import { startOfDay, subYears } from 'date-fns';
import formatDate from '../../utils/formatDate';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import lokalStyling from './FravaerEnkeltAnsattforhold.module.css';
import { Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import { Periode } from '../../state/state';
import Periodevelger from '../Bruttoinntekt/Periodevelger';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import ButtonEndre from '../ButtonEndre';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';
import ButtonTilbakestill from '../ButtonTilbakestill';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import Feilmelding from '../Feilmelding';

interface FravaerEnkeltAnsattforholdProps {
  setIsDirtyForm: (dirty: boolean) => void;
  fravaerPerioder?: Array<Periode>;
  skjemastatus?: SkjemaStatus;
}

export default function FravaerEnkeltAnsattforhold({
  fravaerPerioder,
  skjemastatus,
  setIsDirtyForm
}: Readonly<FravaerEnkeltAnsattforholdProps>) {
  const [requestEndreSykemelding, setRequestEndreSykemelding] = useState<boolean>(false);
  const slettFravaersperiode = useBoundStore((state) => state.slettFravaersperiode);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const tilbakestillFravaersperiode = useBoundStore((state) => state.tilbakestillFravaersperiode);
  const setFravaersperiodeDato = useBoundStore((state) => state.setFravaersperiodeDato);
  const selvbestemtType = useBoundStore((state) => state.selvbestemtType);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tilbakestillFravaersperiode();
  };

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDirtyForm(true);
    leggTilFravaersperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDirtyForm(true);
    setRequestEndreSykemelding(!requestEndreSykemelding);
  };

  const harUfullstendigePerioder = fravaerPerioder?.some((perioder) => !perioder.fom || !perioder.tom) ?? false;
  const erArbeidtakerUtenforAAregisteret =
    selvbestemtType === SelvbestemtTypeConst.UtenArbeidsforhold || selvbestemtType === SelvbestemtTypeConst.Fisker;

  const endreSykemelding = harUfullstendigePerioder || erArbeidtakerUtenforAAregisteret || requestEndreSykemelding;

  const sortertePerioder = fravaerPerioder
    ? [...fravaerPerioder].sort((a, b) => {
        if (a.fom && b.fom) {
          return a.fom.getTime() - b.fom.getTime();
        }
        return 0;
      })
    : [];
  return (
    <>
      {sortertePerioder?.map((periode, periodeIndex) => (
        <div className={lokalStyling.periodewrapper} key={periode.id}>
          {!endreSykemelding && (
            <>
              <div className={lokalStyling.datepickerEscape}>
                <TextLabel data-cy={`sykmelding-${periodeIndex}-fra`}>Fra</TextLabel>
                <div data-cy={`sykmelding-${periodeIndex}-fra-dato`}>{formatDate?.(periode.fom)}</div>
              </div>
              <div className={lokalStyling.datepickerEscape}>
                <TextLabel data-cy={`sykmelding-${periodeIndex}-til`}>Til</TextLabel>
                <div data-cy={`sykmelding-${periodeIndex}-til-dato`}>{formatDate?.(periode.tom)}</div>
              </div>
            </>
          )}
          {endreSykemelding && (
            <Periodevelger
              fomTekst='Fra'
              fomID={ensureValidHtmlId(`sykmeldingsperioder.${periodeIndex}.fom`)}
              fomError={visFeilmeldingTekst(`sykmeldingsperioder.${periodeIndex}.fom`)}
              tomTekst='Til'
              tomID={ensureValidHtmlId(`sykmeldingsperioder.${periodeIndex}.tom`)}
              tomError={visFeilmeldingTekst(`sykmeldingsperioder.${periodeIndex}.tom`)}
              onRangeChange={(oppdatertPeriode) => setFravaersperiodeDato?.(periode.id, oppdatertPeriode)}
              defaultRange={periode}
              kanSlettes={periodeIndex > 0}
              periodeId={periode.id}
              onSlettRad={() => slettFravaersperiode?.(periode.id)}
              fromDate={startOfDay(subYears(new Date(), 10))}
              toDate={new Date()}
            />
          )}
        </div>
      ))}
      {visFeilmeldingTekst(`sykmeldingsperioder`) && (
        <Feilmelding id='sykmeldingsperioder'>{visFeilmeldingTekst(`sykmeldingsperioder`)}</Feilmelding>
      )}

      {skjemastatus !== SkjemaStatus.SELVBESTEMT && endreSykemelding && (
        <ButtonEndre onClick={(event) => clickEndreFravaersperiodeHandler(event)} />
      )}
      {endreSykemelding && (
        <div className={styles.endresykemeldingknapper}>
          <Button
            variant='secondary'
            className={styles.kontrollerknapp}
            onClick={(event) => clickLeggTilFravaersperiodeHandler(event)}
          >
            Legg til periode
          </Button>

          <ButtonTilbakestill onClick={(event) => clickTilbakestillFravaersperiodeHandler(event)} />
        </div>
      )}
    </>
  );
}
