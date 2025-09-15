import { Heading, type HeadingProps } from '@navikt/ds-react';
import type { ReactNode } from 'react';
import clsx from 'classnames';
import styles from './Heading2.module.css';

type AllowedHeading2Sizes = Extract<HeadingProps['size'], 'small' | 'medium' | 'large'>;

export interface Heading2Props {
  children: ReactNode;
  className?: string;
  size?: AllowedHeading2Sizes; // default 'medium'
  id?: string;
}

export function Heading2({ children, className, size = 'medium', id }: Readonly<Heading2Props>) {
  const classes = clsx(styles.heading, className);
  return (
    <Heading size={size} level='2' className={classes} id={id}>
      {children}
    </Heading>
  );
}
