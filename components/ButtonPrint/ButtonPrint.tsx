import { Button } from '@navikt/ds-react';

interface ButtonPrintProps extends React.HTMLProps<HTMLButtonElement> {}

const ButtonPrint = ({ className }: ButtonPrintProps) => {
  const skrivUt = () => window.print();

  return (
    <Button onClick={() => skrivUt()} className={`skjul-fra-print ${className}`} variant='tertiary'>
      Skriv ut
    </Button>
  );
};

export default ButtonPrint;
