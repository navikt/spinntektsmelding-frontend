import { Heading, HeadingProps } from '@navikt/ds-react';
import classNames from 'classnames/bind';
import styles from './H3Label.module.css';

interface H3LabelProps extends Partial<HeadingProps> {
  unPadded?: boolean;
  topPadded?: boolean;
}

const cx = classNames.bind(styles);

export default function H3Label(props: Readonly<H3LabelProps>) {
  const className = cx({ heading: !props.unPadded, heading_top: props.topPadded }, props.className);

  return (
    <Heading size='xsmall' level='3' className={className}>
      {props.children}
    </Heading>
  );
}
