import { Button } from '@navikt/ds-react';
import lokalStyles from './ButtonEndre.module.css';

interface ButtonEndreProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export default function ButtonEndre(props: ButtonEndreProps) {
  return (
    <Button variant='secondary' {...props} className={lokalStyles.endrebutton + ' ' + props.className}>
      Endre
    </Button>
  );
}
