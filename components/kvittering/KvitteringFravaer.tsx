import { BodyLong } from '@navikt/ds-react';
import { ReactNode } from 'react';
import lokalStyling from '../../pages/kvittering/Kvittering.module.css';
import { KvitteringVisning } from '../../utils/lagKvitteringVisning';
import formatDate from '../../utils/formatDate';
import Heading2 from '../Heading2/Heading2';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import Fravaersperiode from './Fravaersperiode';

interface KvitteringFravaerProps {
  sykmeldingsperioder: KvitteringVisning['sykmeldingsperioder'];
  arbeidsgiverperioder: KvitteringVisning['arbeidsgiverperioder'];
  bestemmendeFravaersdag: KvitteringVisning['bestemmendeFravaersdag'];
  paakrevdeOpplysninger: string[];
  visArbeidsgiverperiode?: boolean;
  visBestemmendeFravaersdag?: boolean;
  ingenArbeidsgiverperioder: boolean;
  manglendeFravaersdag?: ReactNode;
}

export default function KvitteringFravaer({
  sykmeldingsperioder,
  arbeidsgiverperioder,
  bestemmendeFravaersdag,
  paakrevdeOpplysninger,
  visArbeidsgiverperiode,
  visBestemmendeFravaersdag,
  ingenArbeidsgiverperioder,
  manglendeFravaersdag
}: Readonly<KvitteringFravaerProps>) {
  return (
    <div className={visArbeidsgiverperiode ? lokalStyling.fravaerswrapperwrapper : ''}>
      {visArbeidsgiverperiode && (
        <Fravaersperiode sykmeldingsperioder={sykmeldingsperioder} paakrevdeOpplysninger={paakrevdeOpplysninger} />
      )}
      <div className={visArbeidsgiverperiode ? lokalStyling.infoboks : ''}>
        <div className={lokalStyling.ytterstefravaerwrapper}>
          {visBestemmendeFravaersdag && (
            <div className={lokalStyling.ytrefravaerswrapper}>
              <Heading2 className={lokalStyling.fravaerstyper}>Bestemmende fraværsdag</Heading2>
              <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
              <div className={lokalStyling.fravaerwrapper}>
                <div className={lokalStyling.fravaertid}>Dato</div>
                <div data-cy='bestemmendefravaersdag'>
                  {bestemmendeFravaersdag ? formatDate(bestemmendeFravaersdag) : manglendeFravaersdag}{' '}
                </div>
              </div>
            </div>
          )}
          {visArbeidsgiverperiode && (
            <div className={lokalStyling.arbeidsgiverperiode}>
              <Heading2 className={lokalStyling.fravaerstyper}>Arbeidsgiverperiode</Heading2>
              {ingenArbeidsgiverperioder ? (
                <BodyLong>Det er ikke arbeidsgiverperiode.</BodyLong>
              ) : (
                <BodyLong>
                  Arbeidsgiver er ansvarlig for å betale ut lønn til den sykmeldte under arbeidsgiverpeioden. Deretter
                  betaler Nav lønn til den syke eller refunderer bedriften.
                </BodyLong>
              )}
              {arbeidsgiverperioder?.map((periode) => (
                <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={periode.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
