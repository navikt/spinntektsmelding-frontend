import React from 'react';
import localStyles from './Egenmelding.module.css';
import Heading3 from '../Heading3/Heading3';
import EgenmeldingLoader from './EgenmeldingLoader';
import TextLabel from '../TextLabel/TextLabel';
import formatDate from '../../utils/formatDate';
import { Periode } from '../../state/state';

interface EgenmeldingProps {
  lasterData?: boolean;
  egenmeldingsperioder: Array<Periode> | undefined;
}

export default function Egenmelding({ lasterData, egenmeldingsperioder }: Readonly<EgenmeldingProps>) {
  const ikkeEgenmeldingPerioder = !egenmeldingsperioder || egenmeldingsperioder.length === 0;

  return (
    <div className={localStyles.egenmeldingWrapper}>
      <Heading3>Egenmelding</Heading3>
      <div>
        <div className={localStyles.egenmeldingWrapper}>
          {lasterData && <EgenmeldingLoader />}
          {!lasterData &&
            egenmeldingsperioder &&
            egenmeldingsperioder.length > 0 &&
            egenmeldingsperioder.map((egenmeldingPeriode, index) => (
              <div className={localStyles.datowrapper} key={egenmeldingPeriode.id}>
                <div className={localStyles.datepickerEscape}>
                  <TextLabel data-cy={`egenmelding-${index}-fra`}>Fra</TextLabel>
                  <div data-cy={`egenmelding-${index}-fra-dato`}>{formatDate?.(egenmeldingPeriode.fom)}</div>
                </div>
                <div className={localStyles.datepickerEscape}>
                  <TextLabel data-cy={`egenmelding-${index}-til`}>Til</TextLabel>
                  <div data-cy={`egenmelding-${index}-til-dato`}>{formatDate?.(egenmeldingPeriode.tom)}</div>
                </div>
              </div>
            ))}
          {!lasterData && ikkeEgenmeldingPerioder && (
            <>Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.</>
          )}
        </div>
      </div>
    </div>
  );
}
