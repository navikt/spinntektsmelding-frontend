import { Link, type LinkProps } from '@navikt/ds-react';

interface LenkeEksterntProps extends Omit<LinkProps, 'children'> {
  isHidden?: boolean;
  children?: React.ReactNode;
}

export default function LenkeEksternt(props: Readonly<LenkeEksterntProps>) {
  const tabIndex = props.isHidden ? -1 : 0;
  const { isHidden, ...restProps } = props;

  return (
    <Link target='_blank' rel='noopener noreferrer' {...restProps} tabIndex={tabIndex}>
      {props.children}
    </Link>
  );
}
