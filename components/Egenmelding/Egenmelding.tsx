import React from 'react';
import lokalStyling from './Egenmelding.module.css';
import Heading3 from '../Heading3/Heading3';
import EgenmeldingLoader from './EgenmeldingLoader';
import TextLabel from '../TextLabel/TextLabel';
import formatDate from '../../utils/formatDate';
import { Periode } from '../../state/state';

interface EgenmeldingProps {
  lasterData?: boolean;
  egenmeldingsperioder: Array<Periode> | undefined;
  unntattAaRegisteret?: boolean;
}

export default function Egenmelding({
  lasterData,
  egenmeldingsperioder,
  unntattAaRegisteret
}: Readonly<EgenmeldingProps>) {
  const ikkeEgenmeldingPerioder = !egenmeldingsperioder || egenmeldingsperioder.length === 0;

  return (
    <div className={lokalStyling.egenmeldingWrapper}>
      <Heading3>Egenmelding</Heading3>
      <div>
        <div className={lokalStyling.egenmeldingWrapper}>
          {lasterData && <EgenmeldingLoader />}
          {!lasterData &&
            egenmeldingsperioder &&
            egenmeldingsperioder.length > 0 &&
            egenmeldingsperioder.map((egenmeldingPeriode, index) => (
              <div className={lokalStyling.datowrapper} key={egenmeldingPeriode.id}>
                <div className={lokalStyling.datepickerEscape}>
                  <TextLabel data-cy={`egenmelding-${index}-fra`}>Fra</TextLabel>
                  <div data-cy={`egenmelding-${index}-fra-dato`}>{formatDate?.(egenmeldingPeriode.fom)}</div>
                </div>
                <div className={lokalStyling.datepickerEscape}>
                  <TextLabel data-cy={`egenmelding-${index}-til`}>Til</TextLabel>
                  <div data-cy={`egenmelding-${index}-til-dato`}>{formatDate?.(egenmeldingPeriode.tom)}</div>
                </div>
              </div>
            ))}
          {!lasterData && ikkeEgenmeldingPerioder && (
            <>
              {!unntattAaRegisteret && (
                <div>Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.</div>
              )}
              {unntattAaRegisteret && (
                <>
                  <div>Vi har ikke opplysninger om egenmeldingsperioder for den sykmeldte.</div>
                  <div>Eventuelle egenmeldingsperioder må legges til ved å legge de til i arbeidsgiverperioden.</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
