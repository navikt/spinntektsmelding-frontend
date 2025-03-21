import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading1.module.css';

interface Heading1Props {
  children: ReactNode;
  className?: any;
  id?: string;
}

export default function Heading1(props: Readonly<Heading1Props>) {
  const classes = props.className ? `${styles.heading} ${props.className}` : styles.heading;

  return (
    <Heading size='medium' level='1' className={classes} id={props.id}>
      {props.children}
    </Heading>
  );
}
