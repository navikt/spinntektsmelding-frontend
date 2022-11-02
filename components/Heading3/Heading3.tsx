import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading3.module.css';

interface Heading3Props {
  children: ReactNode;
  className?: any;
}

export default function Heading3(props: Heading3Props) {
  const classes = !!props.className ? `${styles.heading} ${props.className}` : styles.heading;
  return (
    <Heading size='medium' level='3' className={classes}>
      {props.children}
    </Heading>
  );
}
