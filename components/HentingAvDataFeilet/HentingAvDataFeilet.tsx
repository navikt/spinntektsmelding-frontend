import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, Modal } from '@navikt/ds-react';
import { title } from 'process';

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
    <Modal
      open={open}
      aria-label={visningAriaLabel}
      onClose={handleCloseModal}
      header={{
        heading: visningTitle,
        size: 'medium',
        icon: <ExclamationmarkTriangleIcon title='Advarsel' fontSize='1.5rem' />
      }}
    >
      <Modal.Body>
        <Alert variant='error'>
          <BodyLong>Noe gikk galt under henting av data.</BodyLong>
          <BodyLong>Vennligst prøv igjen ved en senere anledning.</BodyLong>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleCloseModal}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
