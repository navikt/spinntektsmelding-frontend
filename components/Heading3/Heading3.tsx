import { Heading, HeadingProps } from '@navikt/ds-react';
import styles from './Heading3.module.css';

interface Heading3Props extends Partial<HeadingProps> {
  unPadded?: boolean;
  topPadded?: boolean;
}

export default function Heading3(props: Heading3Props) {
  const className = [!props.unPadded && styles.heading, props.topPadded && styles.heading_top, props.className]
    .filter(Boolean)
    .join(' ');

  return (
    <Heading size='medium' level='3' className={className}>
      {props.children}
    </Heading>
  );
}
