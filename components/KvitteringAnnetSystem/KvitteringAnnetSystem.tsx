import React from 'react';
import { BodyLong, BodyShort, Link } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Heading2 from '../Heading2/Heading2';
import lokalStyles from './KvitteringAnnetSystem.module.css';
import environment from '../../config/environment';

interface KvitteringAnnetSystemProps {
  arkivreferanse?: string;
  lenkeTilKvittering?: string;
  lenkeTilKvitteringHref?: string;
  eksterntSystem: string;
  mottattDato?: string;
  kvitteringId: string;
}

const basePath = environment.baseUrl;

export default function KvitteringAnnetSystem(props: Readonly<KvitteringAnnetSystemProps>) {
  return (
    <>
      <Heading1>Mottatt inntektsmelding</Heading1>
      <div className={lokalStyles.hovedinnhold}>
        <Heading2>Denne inntektsmeldingen er mottatt fra et eksternt system</Heading2>
        <BodyLong>
          Vi har mottatt denne inntektsmeldingen fra {props.eksterntSystem}. Det er ikke mulig å gjøre endringer på
          denne innsendingen.
        </BodyLong>
        <BodyShort className={lokalStyles.luftOver}>
          Du kan <Link href={`${basePath}/${props.kvitteringId}/overskriv`}>sende den inn på nytt.</Link> Skjemaet er da
          ikke fylt med data fra siste innsending.
        </BodyShort>

        {props.arkivreferanse && (
          <BodyShort className={lokalStyles.luftOver}>Arkivreferanse: [{props.arkivreferanse}]</BodyShort>
        )}

        {props.lenkeTilKvittering && (
          <BodyShort>
            <Link href={props.lenkeTilKvitteringHref}>{props.lenkeTilKvittering}</Link>[Eventuell lenke til kvittering]
          </BodyShort>
        )}
      </div>
    </>
  );
}
