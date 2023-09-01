import formatDate from '../../utils/formatDate';

import lokalStyles from '../../pages/kvittering/Kvittering.module.css';

interface PeriodeFraTilProps {
  fom?: Date;
  tom?: Date;
}

export default function PeriodeFraTil(props: PeriodeFraTilProps) {
  if (props.fom || props.tom) {
    return (
      <>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Fra</div>
          <div>{props.fom ? formatDate(props.fom) : '&nbsp;'}</div>
        </div>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Til</div>
          <div>{props.tom ? formatDate(props.tom) : '&nbsp;'}</div>
        </div>
      </>
    );
  }
  return null;
}
