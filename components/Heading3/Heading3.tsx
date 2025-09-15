import { Heading, type HeadingProps } from '@navikt/ds-react';
import classNames from 'classnames/bind';
import styles from './Heading3.module.css';

// Limit sizes for H3 if design restricts (adjust if needed)
type AllowedHeading3Sizes = Extract<HeadingProps['size'], 'small' | 'medium'>;

export interface Heading3Props {
  children: HeadingProps['children'];
  className?: string;
  size?: AllowedHeading3Sizes; // default 'medium'
  id?: string;
  unPadded?: boolean;
  topPadded?: boolean;
}

const cx = classNames.bind(styles);

export function Heading3({ children, className, size = 'medium', id, unPadded, topPadded }: Readonly<Heading3Props>) {
  const composed = cx({ heading: !unPadded, heading_top: topPadded }, className);
  return (
    <Heading size={size} level='3' className={composed} id={id}>
      {children}
    </Heading>
  );
}
