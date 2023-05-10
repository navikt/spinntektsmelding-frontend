import { Button } from '@navikt/ds-react';
import lokalStyles from './ButtonTilbakestill.module.css';

interface ButtonTilbakestillProps extends React.HTMLProps<HTMLButtonElement> {}

export default function ButtonTilbakestill(props: ButtonTilbakestillProps) {
  return (
    <Button
      variant='tertiary'
      className={props.className + ' ' + lokalStyles.buttontilbakestill}
      onClick={props.onClick}
    >
      Tilbakestill
    </Button>
  );
}
