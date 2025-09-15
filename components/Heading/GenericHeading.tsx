import { Heading, type HeadingProps } from '@navikt/ds-react';
import clsx from 'classnames';

// Generic heading component to reduce duplication when dynamic level/size is needed.
// Keeps design constraints by allowing size override but controlling allowed levels.
export interface GenericHeadingProps extends Omit<HeadingProps, 'level'> {
  level: 1 | 2 | 3 | 4 | 5 | 6; // Extendable if needed
  className?: string;
}

export function GenericHeading({ level, className, children, ...rest }: Readonly<GenericHeadingProps>) {
  // ds-react Heading expects string level attr ("1".."6") or number? (their API uses level="1"). We cast.
  return (
    <Heading {...rest} level={String(level) as any} className={clsx(className)}>
      {children}
    </Heading>
  );
}

GenericHeading.displayName = 'GenericHeading';
