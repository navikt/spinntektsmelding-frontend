import { Button } from '@navikt/ds-react';

interface PrintButtonInterface extends React.HTMLProps<HTMLButtonElement> {}

const PrintButton = ({ className }: PrintButtonInterface) => {
  const skrivUt = () => window.print();

  return (
    <Button onClick={() => skrivUt()} className={`skjul-fra-print ${className}`} variant='tertiary'>
      Skriv ut
    </Button>
  );
};

export default PrintButton;
