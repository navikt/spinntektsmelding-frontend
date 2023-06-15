import { Heading, HeadingProps } from '@navikt/ds-react';
import styles from './Heading3.module.css';

interface Heading3Props extends Partial<HeadingProps> {
  unPadded?: boolean;
}

export default function Heading3(props: Heading3Props) {
  const padClass = props.unPadded ? '' : styles.heading;
  const classes = !!props.className ? `${padClass} ${props.className}` : padClass;
  return (
    <Heading size='medium' level='3' className={classes}>
      {props.children}
    </Heading>
  );
}
