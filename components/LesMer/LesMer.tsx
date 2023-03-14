import { ReadMore, ReadMoreProps } from '@navikt/ds-react';

import lokalStyles from './LesMer.module.css';

interface LesMerProps extends ReadMoreProps {}

export default function LesMer(props: LesMerProps) {
  return (
    <ReadMore {...props} className={lokalStyles.ReadMore}>
      {props.children}
    </ReadMore>
  );
}
