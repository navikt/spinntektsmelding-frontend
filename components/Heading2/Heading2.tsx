import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading2.module.css';

interface Heading2Props {
  children: ReactNode;
}

export default function Heading2(props: Heading2Props) {
  return (
    <Heading size='medium' level='2' className={styles.heading2}>
      {props.children}
    </Heading>
  );
}
