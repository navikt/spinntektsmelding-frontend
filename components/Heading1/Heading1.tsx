import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading1.module.css';

interface Heading2Props {
  children: ReactNode;
  className?: any;
}

export default function Heading2(props: Heading2Props) {
  const classes = !!props.className ? `${styles.heading} ${props.className}` : styles.heading;

  return (
    <Heading size='medium' level='1' className={classes}>
      {props.children}
    </Heading>
  );
}
