import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, Dialog } from '@navikt/ds-react';

interface HentingAvDataFeiletProps {
  handleCloseModal: () => void;
  open: boolean;
  title?: string;
  ariaLabel?: string;
}

export default function HentingAvDataFeilet({
  handleCloseModal,
  open,
  title,
  ariaLabel
}: Readonly<HentingAvDataFeiletProps>) {
  const visningAriaLabel = ariaLabel ?? 'Henting av skjemadata feilet';
  const visningTitle = title ?? 'Henting av data til inntektsmeldingen feilet.';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleCloseModal()}>
      <Dialog.Popup aria-label={visningAriaLabel}>
        <Dialog.Header>
          <ExclamationmarkTriangleIcon title='Advarsel' fontSize='1.5rem' />
          <Dialog.Title>{visningTitle}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Alert variant='error'>
            <BodyLong>Noe gikk galt under henting av data.</BodyLong>
            <BodyLong>Vennligst prøv igjen ved en senere anledning.</BodyLong>
          </Alert>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant='primary' onClick={handleCloseModal}>
            Lukk
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}
