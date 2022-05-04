import { Button } from '@navikt/ds-react';
// import styles from './Skillelinje.module.css';
import { Delete } from '@navikt/ds-icons';

interface ButtonSletteProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
}

export default function ButtonSlette(props: ButtonSletteProps) {
  return (
    <Button onClick={props.onClick} variant='tertiary'>
      <Delete title={props.title} />
    </Button>
  );
}
