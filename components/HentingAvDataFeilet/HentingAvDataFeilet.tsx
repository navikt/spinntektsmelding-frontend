import { Alert, BodyLong, Button, Heading, Modal } from '@navikt/ds-react';
import lokalStyles from './HentingAvDataFeilet.module.css';

import { useEffect } from 'react';

interface HentingAvDataFeiletProps {
  handleCloseModal: () => void;
  open: boolean;
}

export default function HentingAvDataFeilet({ handleCloseModal, open }: HentingAvDataFeiletProps) {
  useEffect(() => {
    Modal.setAppElement('#body');
  }, []);

  return (
    <Modal
      open={open}
      aria-label='Henting av skjemadata feilet'
      onClose={handleCloseModal}
      aria-labelledby='modal-heading'
      closeButton={false}
    >
      <Modal.Content>
        <Heading size='medium' level='2' id='modal-heading'>
          Henting av data til inntektsmeldingen feilet.
        </Heading>
        <Alert variant='error' className={lokalStyles.alert_innhold}>
          <BodyLong>Noe gikk galt under hending av data.</BodyLong>
          <BodyLong>Vennligst prøv igjen ved en senere anledning.</BodyLong>
        </Alert>
        <Button variant='primary' onClick={handleCloseModal} className={lokalStyles.button_close}>
          Lukk
        </Button>
      </Modal.Content>
    </Modal>
  );
}
