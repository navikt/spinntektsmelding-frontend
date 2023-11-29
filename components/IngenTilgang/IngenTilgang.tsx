import { Alert, Link, Modal } from '@navikt/ds-react';
import env from '../../config/environment';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';

interface IngenTilgangProps {
  handleCloseModal: () => void;
  open: boolean;
}

export default function IngenTilgang({ handleCloseModal, open }: IngenTilgangProps) {
  return (
    <Modal
      open={open}
      aria-label='Du er blitt logget ut, følg instruksjonene for ikke å miste data'
      onClose={handleCloseModal}
      aria-labelledby='modal-heading'
      header={{
        heading: 'Du er blitt logget ut, følg instruksjonene for ikke å miste data',
        size: 'medium',
        icon: <ExclamationmarkTriangleIcon title='Advarsel' fontSize='1.5rem' />
      }}
    >
      <Modal.Body>
        <Alert variant='warning' className='logget-ut-advarsel__innhold'>
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
      </Modal.Body>
    </Modal>
  );
}
