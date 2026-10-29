import { BodyShort, Button, HStack } from '@navikt/ds-react';
import lokalStyling from '../../pages/kvittering/Kvittering.module.css';
import ButtonEndre from '../ButtonEndre';
import ButtonPrint from '../ButtonPrint';

interface KvitteringFooterProps {
  innsendingTidspunkt: string;
  saksoversiktUrl?: string;
  onEndre?: () => void;
}

export default function KvitteringFooter({
  innsendingTidspunkt,
  saksoversiktUrl,
  onEndre
}: Readonly<KvitteringFooterProps>) {
  return (
    <>
      <BodyShort>Inntektsmelding innsendt{innsendingTidspunkt}</BodyShort>
      <HStack justify='space-between' className={lokalStyling.buttonWrapper + ' skjul-fra-print'}>
        <HStack gap='space-64'>
          {onEndre && <ButtonEndre onClick={onEndre} />}
          <Button variant='tertiary' as='a' href={saksoversiktUrl}>
            Lukk
          </Button>
        </HStack>
        <ButtonPrint className={lokalStyling.skrivutknapp}>Skriv ut</ButtonPrint>
      </HStack>
    </>
  );
}
