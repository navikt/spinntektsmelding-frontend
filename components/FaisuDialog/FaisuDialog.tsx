import { Button, Dialog, Radio, RadioGroup } from '@navikt/ds-react';
import localStyles from './FaisuDialog.module.css';
import { useState } from 'react';

interface FaisuDialogProps {
  handleCloseDialog: ({ sammeTimeslonn }: { sammeTimeslonn: string | null }) => void;
  open: boolean;
}

export default function FaisuDialog({ handleCloseDialog, open }: Readonly<FaisuDialogProps>) {
  const [error, setError] = useState<string | undefined>(undefined);
  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sammeTimeslonn = data.get('sammeTimeslonn');
    console.log('sammeTimeslonn', sammeTimeslonn);
    if (sammeTimeslonn !== 'Ja' && sammeTimeslonn !== 'Nei') {
      setError('Du må velge et alternativ');
      return;
    }
    handleCloseDialog({ sammeTimeslonn: sammeTimeslonn as string | null });
  };

  const onChange = () => {
    if (error) {
      setError(undefined);
    }
  };

  const onAvbrytClick = () => {
    history.back();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleCloseDialog({ sammeTimeslonn: null })}>
      <Dialog.Popup>
        <Dialog.Header withClosebutton={false}>
          <Dialog.Title>Flere arbeidsforhold i samme underenhet</Dialog.Title>
          <Dialog.Description>
            Det er registrert flere arbeidsforhold i den samme underenheten, derfor trenger vi noen ekstra opplysninger
            fra deg.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <form id='flere_arbeidsforhold' onSubmit={handleSubmit}>
            <RadioGroup
              legend='Er det samme timeslønn for alle arbeidsforholdene?'
              id='flere_arbeidsforhold'
              name='sammeTimeslonn'
              error={error}
              onChange={onChange}
            >
              <Radio value='Ja' id={'flere_arbeidsforhold_ja'}>
                Ja
              </Radio>
              <Radio value='Nei' id={'flere_arbeidsforhold_nei'}>
                Nei
              </Radio>
            </RadioGroup>
          </form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button type='button' variant='secondary' onClick={onAvbrytClick}>
            Avbryt
          </Button>
          <Button variant='primary' form='flere_arbeidsforhold'>
            Send inn
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}
