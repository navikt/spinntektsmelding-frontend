import { Heading, type HeadingProps } from '@navikt/ds-react';
import type { ReactNode } from 'react';
import clsx from 'classnames';
import styles from './Heading1.module.css';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

// Restrict size to the variants design allows for H1 (adjust if design changes)
type AllowedHeading1Sizes = Extract<HeadingProps['size'], 'medium' | 'large'>; // example restriction

interface Heading1Props {
  children: ReactNode;
  className?: string;
  id?: string;
  size?: AllowedHeading1Sizes; // default 'medium'
}

export function Heading1({ children, className, id, size = 'medium' }: Readonly<Heading1Props>) {
  const classes = clsx(styles.heading, className);
  const safeId = id ? ensureValidHtmlId(id) : undefined;

  return (
    <Heading size={size} level='1' className={classes} id={safeId}>
      {children}
    </Heading>
  );
}
