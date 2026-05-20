import { Button } from '@navikt/ds-react';
import lokalStyling from './ButtonTilbakestill.module.css';

interface ButtonTilbakestillProps extends React.HTMLProps<HTMLButtonElement> {}

export default function ButtonTilbakestill(props: ButtonTilbakestillProps) {
  return (
    <Button
      type='button'
      variant='tertiary'
      className={props.className + ' ' + lokalStyling.buttontilbakestill}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      Tilbakestill
    </Button>
  );
}
