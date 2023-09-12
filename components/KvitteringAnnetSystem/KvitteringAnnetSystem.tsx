import React from 'react';
import { BodyLong, BodyShort, Link } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Heading2 from '../Heading2/Heading2';
import styles from '../../styles/Home.module.css';

interface KvitteringAnnetSystemProps {
  arkivreferanse?: string;
  lenkeTilKvittering?: string;
  lenkeTilKvitteringHref?: string;
}

export default function KvitteringAnnetSystem(props: KvitteringAnnetSystemProps) {
  return (
    <div className={`main-content ${styles.padded}`}>
      <Heading1>Mottatt inntektsmelding</Heading1>
      <div>
        <Heading2>Denne inntektsmeldingen er mottatt fra et eksternt system</Heading2>
        <BodyLong>
          Vi har mottatt denne inntektsmeldingen fra [ref. lønnssystem/altinn]. Hvis du vil se innsendt informasjon
          eller gjøre endringer må du bruke samme system som dere sendte inn denne inntektsmeldingen med.
        </BodyLong>

        {props.arkivreferanse && <BodyShort>Arkivrefferanse: [{props.arkivreferanse}]</BodyShort>}
        {props.lenkeTilKvittering && (
          <BodyShort>
            <Link href={props.lenkeTilKvitteringHref}>{props.lenkeTilKvittering}</Link>[Eventuell lenke til kvittering]
          </BodyShort>
        )}
      </div>
    </div>
  );
}
