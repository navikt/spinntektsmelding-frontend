import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading3.module.css';

interface Heading3Props {
  children: ReactNode;
}

export default function Heading3(props: Heading3Props) {
  return (
    <Heading size='medium' level='3' className={styles.heading3}>
      {props.children}
    </Heading>
  );
}
