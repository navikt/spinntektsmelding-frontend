interface LenkeEksterntProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isHidden?: boolean;
}

export default function LenkeEksternt(props: LenkeEksterntProps) {
  const tabIndex = props.isHidden ? -1 : 0;

  return (
    <a target='_blank' rel='noopener noreferrer' {...props} tabIndex={tabIndex}>
      {props.children}
    </a>
  );
}
