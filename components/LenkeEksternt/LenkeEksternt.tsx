interface LenkeEksterntProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isHidden?: boolean;
}

export default function LenkeEksternt(props: LenkeEksterntProps) {
  const tabIndex = props.isHidden ? -1 : 0;
  const { isHidden, ...restProps } = props;

  return (
    <a target='_blank' rel='noopener noreferrer' {...restProps} tabIndex={tabIndex} className='navds-link'>
      {props.children}
    </a>
  );
}
