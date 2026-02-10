import forespoerselType from '../../../config/forespoerselType';
import { Periode } from '../../../state/state';
import Heading2 from '../../Heading2/Heading2';
import Heading3 from '../../Heading3';
import PeriodeFraTil from '../../PeriodeFraTil/PeriodeFraTil';
import lokalStyles from './Fravaersperiode.module.css';

interface FravaersperiodeProps {
  sykmeldingsperioder?: Periode[];
  paakrevdeOpplysninger: string[];
}

export default function Fravaersperiode({
  sykmeldingsperioder,
  paakrevdeOpplysninger
}: Readonly<FravaersperiodeProps>) {
  const classNameHeadingSykmelding = paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode)
    ? lokalStyles.sykfravaerstyper
    : '';

  return (
    <div className={lokalStyles.fravaersperiode}>
      <Heading2>Fraværsperiode</Heading2>
      <div className={lokalStyles.ytterstefravaerwrapper}>
        <div className={lokalStyles.ytrefravaerswrapper}>
          <Heading3 className={classNameHeadingSykmelding}>Sykmelding</Heading3>
          {sykmeldingsperioder?.map((periode) => (
            <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={'fperiode' + (periode.id ?? periode.fom)} />
          ))}
        </div>
      </div>
    </div>
  );
}
