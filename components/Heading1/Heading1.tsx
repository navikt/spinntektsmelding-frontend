import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading1.module.css';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface Heading1Props {
  children: ReactNode;
  className?: any;
  id?: string;
}

export default function Heading1(props: Readonly<Heading1Props>) {
  const classes = props.className ? `${styles.heading} ${props.className}` : styles.heading;

  const elementId = props.id ? ensureValidHtmlId(props.id) : undefined;

  return (
    <Heading size='medium' level='1' className={classes} id={elementId}>
      {props.children}
    </Heading>
  );
}
