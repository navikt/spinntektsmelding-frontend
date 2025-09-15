import forespoerselType from '../../../config/forespoerselType';
import { Periode } from '../../../state/state';
import { Heading2 } from '../../Heading2/Heading2';
import { Heading3 } from '../../Heading3/Heading3';
import PeriodeFraTil from '../../PeriodeFraTil/PeriodeFraTil';
import lokalStyles from './Fravaersperiode.module.css';
import classNames from 'classnames/bind';

interface FravaersperiodeProps {
  sykmeldingsperioder?: Periode[];
  egenmeldingsperioder?: Periode[];
  paakrevdeOpplysninger: string[];
}

export default function Fravaersperiode({
  sykmeldingsperioder,
  egenmeldingsperioder,
  paakrevdeOpplysninger
}: Readonly<FravaersperiodeProps>) {
  const cx = classNames.bind(lokalStyles);
  const classNameHeadingSykmelding = cx({
    sykfravaerstyper: paakrevdeOpplysninger?.includes(forespoerselType.arbeidsgiverperiode)
  });
  const harAktiveEgenmeldingsperioder = () => {
    return egenmeldingsperioder
      ? egenmeldingsperioder.find((periode) => periode.fom || periode.tom) !== undefined
      : undefined;
  };
  return (
    <div className={lokalStyles.fravaersperiode}>
      <Heading2>Fraværsperiode</Heading2>
      {harAktiveEgenmeldingsperioder() && (
        <div className={lokalStyles.ytterstefravaerwrapper}>
          <div className={lokalStyles.ytrefravaerswrapper}>
            <Heading3 className={lokalStyles.sykfravaerstyper}>Egenmelding</Heading3>
            {egenmeldingsperioder?.map((periode) => (
              <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={'egenmelding' + periode.id} />
            ))}
          </div>
        </div>
      )}
      <div className={lokalStyles.ytterstefravaerwrapper}>
        <div className={lokalStyles.ytrefravaerswrapper}>
          <Heading3 className={classNameHeadingSykmelding}>Sykmelding</Heading3>
          {sykmeldingsperioder?.map((periode) => (
            <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={'fperiode' + periode.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
