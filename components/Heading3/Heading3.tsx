import { Heading, HeadingProps } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './Heading3.module.css';

interface Heading3Props extends Partial<HeadingProps> {
  unPadded?: boolean;
  topPadded?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function Heading3(props: Readonly<Heading3Props>) {
  const { unPadded, topPadded, className: customClassName, children, ...headingProps } = props;
  const className = [!unPadded && styles.heading, topPadded && styles.heading_top, customClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <Heading {...headingProps} size='medium' level='3' className={className}>
      {children}
    </Heading>
  );
}
