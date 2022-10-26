import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading4.module.css';

interface Heading4Props {
  children: ReactNode;
  className?: any;
}

export default function Heading4(props: Heading4Props) {
  const classes = !!props.className ? `${styles.heading} ${props.className}` : styles.heading;
  return (
    <Heading size='medium' level='4' className={classes}>
      {props.children}
    </Heading>
  );
}
