import formatDate from '../../utils/formatDate';

import lokalStyles from '../../pages/kvittering/Kvittering.module.css';

interface PeriodeFraTilProps {
  fom?: Date;
  tom?: Date;
  fomTekst?: string;
  tomTekst?: string;
}

export default function PeriodeFraTil(props: PeriodeFraTilProps) {
  const visningFom = props.fomTekst ?? 'Fra';
  const visningTom = props.tomTekst ?? 'Til';
  if (props.fom || props.tom) {
    return (
      <>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>{visningFom}</div>
          <div>{props.fom ? formatDate(props.fom) : '&nbsp;'}</div>
        </div>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>{visningTom}</div>
          <div>{props.tom ? formatDate(props.tom) : '&nbsp;'}</div>
        </div>
      </>
    );
  }
  return null;
}
