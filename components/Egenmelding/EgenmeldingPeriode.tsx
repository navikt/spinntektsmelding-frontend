import { Periode } from '../../state/state';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import localStyles from './Egenmelding.module.css';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
  endreEgenmeldingsperiode: boolean;
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  toDate: Date;
  kanSlettes: boolean;
  onSlettRad: () => void;
  disabled?: boolean;
  rad: number;
  visFeilmeldingsTekst: (feilmelding: string) => string;
}

export default function EgenmeldingPeriode({
  periodeId,
  egenmeldingsperiode,
  endreEgenmeldingsperiode,
  setEgenmeldingDato,
  toDate,
  kanSlettes,
  onSlettRad,
  disabled,
  rad,
  visFeilmeldingsTekst
}: EgenmeldingPeriodeInterface) {
  const rangeChangeHandler = (dateRange: PeriodeParam | undefined) => {
    setEgenmeldingDato(dateRange, periodeId);
  };

  if (!endreEgenmeldingsperiode) {
    return (
      <div data-cy='egenmelding'>
        <div className={styles.datepickerescape}>
          <TextLabel>Fra</TextLabel>
          <div id={`egenmeldingsperioder[${rad}].fom`} data-cy='egenmelding-fra'>
            {formatDate(egenmeldingsperiode.fom)}
          </div>
        </div>
        <div className={styles.datepickerescape}>
          <TextLabel>Til</TextLabel>
          <div id={`egenmeldingsperioder[${rad}].tom`} data-cy='egenmelding-til'>
            {formatDate(egenmeldingsperiode.tom)}
          </div>
        </div>
      </div>
    );
  }

  const defaultMnd = toDate || new Date();
  const sletteklasse = kanSlettes ? localStyles.kanSlettes : '';
  return (
    <div data-cy='egenmelding' className={localStyles.datepickerytrewrapper}>
      <Periodevelger
        fomTekst='Fra'
        fomID={`egenmeldingsperioder[${rad}].fom`}
        tomTekst='Til'
        tomID={`egenmeldingsperioder[${rad}].tom`}
        onRangeChange={rangeChangeHandler}
        defaultRange={egenmeldingsperiode}
        kanSlettes={kanSlettes}
        periodeId={periodeId}
        onSlettRad={onSlettRad}
        toDate={toDate}
        disabled={disabled}
        defaultMonth={defaultMnd}
        fomError={visFeilmeldingsTekst(`egenmeldingsperioder[${rad}].fom`)}
        tomError={visFeilmeldingsTekst(`egenmeldingsperioder[${rad}].tom`)}
      />
    </div>
  );
}
