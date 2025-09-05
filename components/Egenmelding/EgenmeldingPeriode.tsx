import { Periode } from '../../state/state';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import localStyles from './Egenmelding.module.css';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
  kanEndreEgenmeldingPeriode: boolean;
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  toDate: Date;
  kanSlettes: boolean;
  onSlettRad: () => void;
  disabled?: boolean;
  rad: number;
  visFeilmeldingTekst: (feilmelding: string) => string;
}

export default function EgenmeldingPeriode({
  periodeId,
  egenmeldingsperiode,
  kanEndreEgenmeldingPeriode,
  setEgenmeldingDato,
  toDate,
  kanSlettes,
  onSlettRad,
  disabled,
  rad,
  visFeilmeldingTekst
}: Readonly<EgenmeldingPeriodeInterface>) {
  const rangeChangeHandler = (dateRange: PeriodeParam | undefined) => {
    setEgenmeldingDato(dateRange, periodeId);
  };

  if (!kanEndreEgenmeldingPeriode) {
    return (
      <div data-cy='egenmelding'>
        <div className={styles.datepickerEscape}>
          <TextLabel>Fra</TextLabel>
          <div id={ensureValidHtmlId(`agp.egenmeldinger[${rad}].fom`)} data-cy='egenmelding-fra'>
            {formatDate(egenmeldingsperiode.fom)}
          </div>
        </div>
        <div className={styles.datepickerEscape}>
          <TextLabel>Til</TextLabel>
          <div id={ensureValidHtmlId(`agp.egenmeldinger[${rad}].tom`)} data-cy='egenmelding-til'>
            {formatDate(egenmeldingsperiode.tom)}
          </div>
        </div>
      </div>
    );
  }

  const defaultMnd = toDate || new Date();

  return (
    <div data-cy='egenmelding' className={localStyles.datepickerytrewrapper}>
      <Periodevelger
        fomTekst='Fra'
        fomID={`agp.egenmeldinger[${rad}].fom`}
        tomTekst='Til'
        tomID={`agp.egenmeldinger[${rad}].tom`}
        onRangeChange={(dateRange) => rangeChangeHandler(dateRange)}
        defaultRange={egenmeldingsperiode}
        kanSlettes={kanSlettes}
        periodeId={periodeId}
        onSlettRad={onSlettRad}
        toDate={toDate}
        disabled={disabled}
        defaultMonth={defaultMnd}
        fomError={visFeilmeldingTekst(`agp.egenmeldinger.${rad}.fom`)}
        tomError={visFeilmeldingTekst(`agp.egenmeldinger.${rad}.tom`)}
      />
    </div>
  );
}
