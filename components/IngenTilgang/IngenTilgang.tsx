import { LocalAlert, Dialog, Link } from '@navikt/ds-react';
import env from '../../config/environment';

interface IngenTilgangProps {
  handleCloseModal: () => void;
  open: boolean;
}

export default function IngenTilgang({ handleCloseModal, open }: Readonly<IngenTilgangProps>) {
  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleCloseModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Du er blitt logget ut, følg instruksjonene for ikke å miste data</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <LocalAlert status='warning' className='logget-ut-advarsel__innhold'>
            <LocalAlert.Header>
              <LocalAlert.Title as='h3'>Logg inn på nytt for å beholde dataene</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
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
            </LocalAlert.Content>
          </LocalAlert>
        </Dialog.Body>
      </Dialog.Popup>
    </Dialog>
  );
}
