import formatDate from '../../utils/formatDate';

import lokalStyles from '../../pages/kvittering/Kvittering.module.css';

interface PeriodeFraTilProps {
  fra: Date;
  til: Date;
}

export default function PeriodeFraTil(props: PeriodeFraTilProps) {
  if (props.fra || props.til) {
    return (
      <>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Fra</div>
          <div>{formatDate(props.fra)}</div>
        </div>
        <div className={lokalStyles.fravaerwrapper}>
          <div className={lokalStyles.fravaertid}>Til</div>
          <div>{formatDate(props.til)}</div>
        </div>
      </>
    );
  }
  return null;
}
