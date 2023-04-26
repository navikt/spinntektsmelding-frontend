import { Alert, BodyLong, Button, Heading, Link, Modal } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import env from '../../config/environment';

interface IngenTilgangProps {
  handleCloseModal: () => void;
  open: boolean;
}

export default function IngenTilgang({ handleCloseModal, open }: IngenTilgangProps) {
  useEffect(() => {
    Modal.setAppElement('#body');
  }, []);

  return (
    <Modal
      open={open}
      aria-label='Du er blitt logget ut, følg instruksjonene for ikke å miste data'
      onClose={handleCloseModal}
      aria-labelledby='modal-heading'
    >
      <Modal.Content>
        <Alert variant='warning' className='logget-ut-advarsel__innhold'>
          <Heading size='large' level='2' id='modal-heading'>
            Du er blitt logget ut, følg instruksjonene for ikke å miste data
          </Heading>
          <ul>
            <li>Ikke lukk dette vinduet</li>
            <li>
              <Link href={env.loginServiceUrlUtenRedirect} rel='noopener noreferrer' target='_blank'>
                Åpne ID-Porten (innlogging) i nytt vindu ved å klikke på denne lenken.
              </Link>
            </li>
            <li>Logg inn på nytt i ID-porten.</li>
            <li>Returner til dette vinduet.</li>
            <li>Lukk denne meldingen og klikk igjen på “Send”</li>
          </ul>
        </Alert>
      </Modal.Content>
    </Modal>
  );
}
