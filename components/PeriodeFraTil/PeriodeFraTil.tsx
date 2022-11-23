import formatDate from '../../utils/formatDate';

import lokalStyles from '../../pages/kvittering/Kvittering.module.css';

interface PeriodeFraTilProps {
  fom: Date;
  tom: Date;
}

export default function PeriodeFraTil(props: PeriodeFraTilProps) {
  if (props.fom || props.tom) {
    return (
      <>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Fra</div>
          <div>{formatDate(props.fom)}</div>
        </div>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Til</div>
          <div>{formatDate(props.tom)}</div>
        </div>
      </>
    );
  }
  return null;
}
