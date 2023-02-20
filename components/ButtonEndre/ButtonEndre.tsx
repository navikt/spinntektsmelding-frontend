import { Button } from '@navikt/ds-react';
import classNames from 'classnames';
import lokalStyles from './ButtonEndre.module.css';

interface ButtonEndreProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export default function ButtonEndre(props: ButtonEndreProps) {
  return (
    <Button variant='secondary' {...props} className={classNames(lokalStyles.endrebutton, props.className)}>
      Endre
    </Button>
  );
}
