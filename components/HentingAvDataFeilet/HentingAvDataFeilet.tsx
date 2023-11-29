import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, Modal } from '@navikt/ds-react';

interface HentingAvDataFeiletProps {
  handleCloseModal: () => void;
  open: boolean;
}

export default function HentingAvDataFeilet({ handleCloseModal, open }: HentingAvDataFeiletProps) {
  return (
    <Modal
      open={open}
      aria-label='Henting av skjemadata feilet'
      onClose={handleCloseModal}
      header={{
        heading: 'Henting av data til inntektsmeldingen feilet.',
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
