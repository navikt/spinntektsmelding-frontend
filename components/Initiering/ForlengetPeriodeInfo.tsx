import { Box, Link } from '@navikt/ds-react';
import { OrganisasjonInfo, PersonInfo } from './InitieringInfo';
import type { ArbeidsgiverSelect } from '../SelectArbeidsgiver/SelectArbeidsgiver';

type ForlengetPeriodeInfoProps = Readonly<{
  href?: string;
  orgNr?: string;
  arbeidsforhold: ArbeidsgiverSelect[];
  navn?: string;
  fnr?: string;
  fomDato: string;
  tomDato: string;
}>;

export default function ForlengetPeriodeInfo({
  href,
  orgNr,
  arbeidsforhold,
  navn,
  fnr,
  fomDato,
  tomDato
}: ForlengetPeriodeInfoProps) {
  return (
    <Box paddingBlock='space-4' borderWidth='1' paddingInline='space-16'>
      <OrganisasjonInfo orgNr={orgNr} arbeidsforhold={arbeidsforhold} />
      {href ? (
        <Link href={href}>
          <PersonInfo navn={navn} fnr={fnr} />
        </Link>
      ) : (
        <PersonInfo navn={navn} fnr={fnr} />
      )}
      <p>
        Sykmeldingsperiode: {fomDato} - {tomDato}
      </p>
    </Box>
  );
}
