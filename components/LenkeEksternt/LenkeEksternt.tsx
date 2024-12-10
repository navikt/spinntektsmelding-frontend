import { Link } from '@navikt/ds-react';

interface LenkeEksterntProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isHidden?: boolean;
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
