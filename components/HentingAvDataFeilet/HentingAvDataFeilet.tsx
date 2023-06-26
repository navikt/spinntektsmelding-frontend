import { Alert, BodyShort, Heading, Modal } from '@navikt/ds-react';
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
    >
      <Modal.Content>
        <Alert variant='error' className='logget-ut-advarsel__innhold'>
          <Heading size='large' level='2' id='modal-heading'>
            Henting av data til inntektsmeldingen feilet.
          </Heading>

          <BodyShort>Noe gikk galt under hending av data.</BodyShort>
          <BodyShort>Vennligst prøv igjen ved en senere anledning.</BodyShort>
        </Alert>
      </Modal.Content>
    </Modal>
  );
}
