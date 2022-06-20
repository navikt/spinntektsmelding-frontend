import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading4.module.css';

interface Heading4Props {
  children: ReactNode;
  className: any;
}

export default function Heading4(props: Heading4Props) {
  const classes = !!props.className ? `${styles.heading4} ${props.className}` : styles.heading4;
  return (
    <Heading size='small' level='4' className={classes}>
      {props.children}
    </Heading>
  );
}
