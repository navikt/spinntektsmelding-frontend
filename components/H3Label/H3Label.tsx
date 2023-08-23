import { Heading, HeadingProps } from '@navikt/ds-react';
import classNames from 'classnames/bind';
import styles from './H3Label.module.css';

interface Heading3Props extends Partial<HeadingProps> {
  unPadded?: boolean;
  topPadded?: boolean;
}

const cx = classNames.bind(styles);

export default function Heading3(props: Heading3Props) {
  const className = cx({ heading: !props.unPadded, heading_top: props.topPadded }, props.className);

  return (
    <Heading size='xsmall' level='3' className={className}>
      {props.children}
    </Heading>
  );
}
